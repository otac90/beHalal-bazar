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
  using (status in ('ACTIVE', 'RESERVED', 'SOLD') or (select auth.uid()) = user_id);

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
      and (l.status in ('ACTIVE', 'RESERVED', 'SOLD') or l.user_id = (select auth.uid()))
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
