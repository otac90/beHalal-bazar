-- Marketplace schema for listings and listing images.
-- Run after supabase/profiles.sql has been applied.

create extension if not exists pgcrypto;

drop table if exists public.reviews cascade;
drop function if exists public.refresh_profile_rating();
alter table if exists public.profiles
  drop column if exists rating_average,
  drop column if exists rating_count;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('SELL', 'FREE', 'WANTED')),
  title text not null check (char_length(title) between 3 and 140),
  description text not null check (char_length(description) between 10 and 10000),
  category_id text not null,
  subcategory_id text,
  brand text,
  condition text not null check (condition in ('NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'USED', 'DEFECTIVE')),
  price numeric(12, 2) not null default 0 check (price >= 0),
  negotiable boolean not null default false,
  is_free boolean not null default false,
  max_budget numeric(12, 2) check (max_budget is null or max_budget >= 0),
  delivery_type text not null check (delivery_type in ('PICKUP', 'SHIPPING', 'BOTH')),
  country text not null default 'Österreich',
  postal_code text not null,
  city text not null,
  status text not null default 'PENDING' check (status in ('DRAFT', 'PENDING', 'ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED', 'REJECTED', 'BLOCKED', 'DELETED')),
  views integer not null default 0 check (views >= 0),
  favorites_count integer not null default 0 check (favorites_count >= 0),
  moderation_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz,
  expires_at timestamptz,
  constraint listings_free_values check (
    (type = 'FREE' and is_free = true and price = 0 and negotiable = false)
    or (type <> 'FREE' and is_free = false)
  ),
  constraint listings_wanted_budget check (
    (type = 'WANTED') or max_budget is null
  )
);

alter table public.listings
  add column if not exists listing_fee numeric(12, 2) not null default 0 check (listing_fee >= 0),
  add column if not exists listing_duration_days integer check (listing_duration_days is null or listing_duration_days > 0),
  add column if not exists details jsonb not null default '{}'::jsonb,
  add column if not exists payment_status text not null default 'NOT_REQUIRED' check (payment_status in ('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'CANCELED')),
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;

create unique index if not exists listings_stripe_checkout_session_idx
  on public.listings(stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists listings_user_id_idx on public.listings(user_id);
create index if not exists listings_status_created_at_idx on public.listings(status, created_at desc);
create index if not exists listings_category_idx on public.listings(category_id, subcategory_id);

create or replace function public.protect_listing_payment_state()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Browser-authenticated users may create a pending paid listing, but only
  -- the server-side Stripe webhook may mark it paid and publish it.
  if (select auth.uid()) is not null then
    if tg_op = 'INSERT' and new.listing_fee > 0 and (new.status <> 'PENDING' or new.payment_status <> 'PENDING') then
      raise exception 'Paid listings must remain pending until Stripe confirms payment';
    end if;

    if tg_op = 'UPDATE' and (
      new.payment_status is distinct from old.payment_status
      or new.stripe_checkout_session_id is distinct from old.stripe_checkout_session_id
      or new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id
      or new.paid_at is distinct from old.paid_at
    ) then
      raise exception 'Payment state is managed by the server';
    end if;

    if old.payment_status = 'PENDING' and new.status = 'ACTIVE' then
      raise exception 'Paid listings can only be published after Stripe confirmation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_listing_payment_state on public.listings;
create trigger protect_listing_payment_state
  before insert or update on public.listings
  for each row execute procedure public.protect_listing_payment_state();

revoke all on function public.protect_listing_payment_state() from public;

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists listing_images_one_cover_idx
  on public.listing_images(listing_id) where is_cover = true;
create index if not exists listing_images_listing_id_idx on public.listing_images(listing_id, sort_order);

create or replace function public.set_marketplace_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
  before update on public.listings
  for each row execute procedure public.set_marketplace_updated_at();

alter table public.listings enable row level security;
alter table public.listing_images enable row level security;

drop policy if exists "Authenticated users can view listings" on public.listings;
create policy "Authenticated users can view listings"
  on public.listings for select to authenticated
  using (((status in ('ACTIVE', 'RESERVED', 'SOLD')) and (expires_at is null or expires_at > timezone('utc', now()))) or (select auth.uid()) = user_id);

drop policy if exists "Users can create their own listings" on public.listings;
create policy "Users can create their own listings"
  on public.listings for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own listings" on public.listings;
create policy "Users can update their own listings"
  on public.listings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own listings" on public.listings;
create policy "Users can delete their own listings"
  on public.listings for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Authenticated users can view listing images" on public.listing_images;
create policy "Authenticated users can view listing images"
  on public.listing_images for select to authenticated
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (((l.status in ('ACTIVE', 'RESERVED', 'SOLD')) and (l.expires_at is null or l.expires_at > timezone('utc', now()))) or l.user_id = (select auth.uid()))
  ));

drop policy if exists "Owners can manage listing images" on public.listing_images;
create policy "Owners can manage listing images"
  on public.listing_images for all to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.user_id = (select auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.user_id = (select auth.uid())));

grant select, insert, update, delete on public.listings to authenticated;
grant select, insert, update, delete on public.listing_images to authenticated;

-- Storage setup for user-uploaded listing images.
-- The bucket `listing-images` must already exist. It is public because listing
-- image URLs are shown to authenticated marketplace members via getPublicUrl.
update storage.buckets
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'listing-images';

drop policy if exists "Users can upload their listing images" on storage.objects;
create policy "Users can upload their listing images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update their listing images" on storage.objects;
create policy "Users can update their listing images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'listing-images'
    and owner_id = (select auth.uid())::text
  )
  with check (
    bucket_id = 'listing-images'
    and owner_id = (select auth.uid())::text
  );

drop policy if exists "Users can delete their listing images" on storage.objects;
create policy "Users can delete their listing images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-images'
    and owner_id = (select auth.uid())::text
  );

-- Text-only member messaging. Conversation membership is restricted to the
-- buyer and seller of the related listing; message read state is private.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint conversations_not_self check (buyer_id <> seller_id),
  constraint conversations_one_per_buyer_listing unique (listing_id, buyer_id)
);

alter table public.conversations
  add column if not exists buyer_display_name text not null default '',
  add column if not exists buyer_avatar_url text,
  add column if not exists seller_display_name text not null default '',
  add column if not exists seller_avatar_url text;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '' check (char_length(btrim(content)) between 0 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.messages drop constraint if exists messages_content_check;
alter table public.messages add constraint messages_content_check check (char_length(btrim(content)) between 0 and 4000);

alter table public.conversations
  add column if not exists unread_for_buyer boolean not null default false,
  add column if not exists unread_for_seller boolean not null default false,
  add column if not exists deleted_by_buyer_at timestamptz,
  add column if not exists deleted_by_seller_at timestamptz;

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default 'Sonstiger Grund',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

alter table public.user_blocks add column if not exists reason text not null default 'Sonstiger Grund';

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (char_length(mime_type) between 1 and 150),
  file_size bigint not null check (file_size > 0 and file_size <= 20971520),
  storage_path text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists message_attachments_message_idx on public.message_attachments(message_id);

create table if not exists public.chat_reports (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  status text not null default 'OPEN' check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint chat_reports_not_self check (reporter_id <> reported_user_id)
);

create index if not exists conversations_buyer_idx on public.conversations(buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations(seller_id, last_message_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at asc);
create index if not exists messages_unread_idx on public.messages(sender_id, read_at) where read_at is null;

-- Keep the avatar snapshots in existing conversations in sync with profile edits.
update public.conversations c
set buyer_avatar_url = p.avatar_url
from public.profiles p
where p.id = c.buyer_id and p.avatar_url is not null;

update public.conversations c
set seller_avatar_url = p.avatar_url
from public.profiles p
where p.id = c.seller_id and p.avatar_url is not null;

create or replace function public.sync_conversation_profile_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set buyer_display_name = case when buyer_id = new.id then concat(new.first_name, ' ', new.last_name) else buyer_display_name end,
      buyer_avatar_url = case when buyer_id = new.id then new.avatar_url else buyer_avatar_url end,
      seller_display_name = case when seller_id = new.id then concat(new.first_name, ' ', new.last_name) else seller_display_name end,
      seller_avatar_url = case when seller_id = new.id then new.avatar_url else seller_avatar_url end,
      updated_at = timezone('utc', now())
  where buyer_id = new.id or seller_id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_conversation_profile_snapshot on public.profiles;
create trigger sync_conversation_profile_snapshot
  after update of first_name, last_name, avatar_url on public.profiles
  for each row execute procedure public.sync_conversation_profile_snapshot();

revoke all on function public.sync_conversation_profile_snapshot() from public;

create or replace function public.touch_conversation_from_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations c
  set last_message = coalesce(nullif(btrim(new.content), ''), '[Datei]'),
      last_message_at = new.created_at,
      updated_at = timezone('utc', now()),
      unread_for_buyer = (new.sender_id <> c.buyer_id),
      unread_for_seller = (new.sender_id <> c.seller_id),
      deleted_by_buyer_at = null,
      deleted_by_seller_at = null
  where c.id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists touch_conversation_from_message on public.messages;
create trigger touch_conversation_from_message
  after insert on public.messages
  for each row execute procedure public.touch_conversation_from_message();
revoke all on function public.touch_conversation_from_message() from public;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.user_blocks enable row level security;
alter table public.message_attachments enable row level security;
alter table public.chat_reports enable row level security;

drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));

drop policy if exists "Buyers can start conversations" on public.conversations;
create policy "Buyers can start conversations"
  on public.conversations for insert to authenticated
  with check (
    (select auth.uid()) = buyer_id
    and buyer_id <> seller_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.user_id = seller_id
        and l.status in ('ACTIVE', 'RESERVED', 'SOLD')
    )
  );

drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
  on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (select auth.uid()) in (c.buyer_id, c.seller_id)
  ));

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert to authenticated
  with check (
    (select auth.uid()) = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (select auth.uid()) in (c.buyer_id, c.seller_id)
        and not exists (
          select 1 from public.user_blocks b
          where (b.blocker_id = (select auth.uid()) and b.blocked_id = case when c.buyer_id = (select auth.uid()) then c.seller_id else c.buyer_id end)
             or (b.blocked_id = (select auth.uid()) and b.blocker_id = case when c.buyer_id = (select auth.uid()) then c.seller_id else c.buyer_id end)
        )
    )
  );

drop policy if exists "Recipients can mark messages read" on public.messages;
create policy "Recipients can mark messages read"
  on public.messages for update to authenticated
  using (
    sender_id <> (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  )
  with check (read_at is not null);

drop policy if exists "Participants can update conversation state" on public.conversations;
create policy "Participants can update conversation state"
  on public.conversations for update to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id))
  with check ((select auth.uid()) in (buyer_id, seller_id));

drop policy if exists "Participants can view blocks" on public.user_blocks;
create policy "Participants can view blocks"
  on public.user_blocks for select to authenticated
  using (blocker_id = (select auth.uid()));

drop policy if exists "Users can block other users" on public.user_blocks;
create policy "Users can block other users"
  on public.user_blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()) and blocker_id <> blocked_id);

drop policy if exists "Users can unblock other users" on public.user_blocks;
create policy "Users can unblock other users"
  on public.user_blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

drop policy if exists "Participants can view message attachments" on public.message_attachments;
create policy "Participants can view message attachments"
  on public.message_attachments for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and (select auth.uid()) in (c.buyer_id, c.seller_id)));

drop policy if exists "Users can add their message attachments" on public.message_attachments;
create policy "Users can add their message attachments"
  on public.message_attachments for insert to authenticated
  with check (sender_id = (select auth.uid()) and exists (select 1 from public.conversations c where c.id = conversation_id and (select auth.uid()) in (c.buyer_id, c.seller_id)));

drop policy if exists "Users can delete their message attachments" on public.message_attachments;
create policy "Users can delete their message attachments"
  on public.message_attachments for delete to authenticated
  using (sender_id = (select auth.uid()));

drop policy if exists "Users can submit chat reports" on public.chat_reports;
create policy "Users can submit chat reports"
  on public.chat_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and exists (select 1 from public.conversations c where c.id = conversation_id and reporter_id in (c.buyer_id, c.seller_id) and reported_user_id in (c.buyer_id, c.seller_id) and reporter_id <> reported_user_id));

drop policy if exists "Users can view their chat reports" on public.chat_reports;
create policy "Users can view their chat reports"
  on public.chat_reports for select to authenticated
  using (reporter_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments', 'chat-attachments', false, 20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update set public = false, file_size_limit = 20971520, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload chat attachments" on storage.objects;
create policy "Users can upload chat attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.conversations c where c.id = ((storage.foldername(name))[2])::uuid and (select auth.uid()) in (c.buyer_id, c.seller_id))
  );

drop policy if exists "Participants can view chat attachments" on storage.objects;
create policy "Participants can view chat attachments"
  on storage.objects for select to authenticated
  using (bucket_id = 'chat-attachments' and exists (select 1 from public.conversations c where c.id = ((storage.foldername(name))[2])::uuid and (select auth.uid()) in (c.buyer_id, c.seller_id)));

drop policy if exists "Users can delete their chat attachments" on storage.objects;
create policy "Users can delete their chat attachments"
  on storage.objects for delete to authenticated
  using (bucket_id = 'chat-attachments' and owner_id = (select auth.uid())::text);

grant select, insert, update on public.conversations to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, delete on public.user_blocks to authenticated;
grant select, insert, delete on public.message_attachments to authenticated;
grant select, insert on public.chat_reports to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations') then
    alter publication supabase_realtime add table public.conversations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'message_attachments') then
    alter publication supabase_realtime add table public.message_attachments;
  end if;
end;
$$;
