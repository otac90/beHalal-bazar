-- Marketplace schema for listings, listing images, and user reviews.
-- Run after supabase/profiles.sql has been applied.

create extension if not exists pgcrypto;

alter table if exists public.profiles
  add column if not exists rating_average numeric(3, 2) not null default 0,
  add column if not exists rating_count integer not null default 0;

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

create index if not exists listings_user_id_idx on public.listings(user_id);
create index if not exists listings_status_created_at_idx on public.listings(status, created_at desc);
create index if not exists listings_category_idx on public.listings(category_id, subcategory_id);

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

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2000),
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reviews_not_self check (reviewer_id <> reviewed_user_id),
  constraint reviews_one_per_pair unique (reviewer_id, reviewed_user_id)
);

create index if not exists reviews_reviewed_user_idx on public.reviews(reviewed_user_id, created_at desc);

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

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
  before update on public.reviews
  for each row execute procedure public.set_marketplace_updated_at();

create or replace function public.refresh_profile_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid := coalesce(new.reviewed_user_id, old.reviewed_user_id);
begin
  update public.profiles
  set rating_average = coalesce((
        select round(avg(r.rating)::numeric, 2)
        from public.reviews r
        where r.reviewed_user_id = target_id
      ), 0),
      rating_count = (
        select count(*)
        from public.reviews r
        where r.reviewed_user_id = target_id
      ),
      updated_at = timezone('utc', now())
  where id = target_id;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- Rating aggregates are maintained server-side from the reviews table and are
-- never writable by an authenticated frontend client.
drop trigger if exists refresh_profile_rating_after_review on public.reviews;
create trigger refresh_profile_rating_after_review
  after insert or update or delete on public.reviews
  for each row execute procedure public.refresh_profile_rating();

alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.reviews enable row level security;

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

drop policy if exists "Authenticated users can view reviews" on public.reviews;
create policy "Authenticated users can view reviews"
  on public.reviews for select to authenticated
  using (true);

drop policy if exists "Users can create reviews for other users" on public.reviews;
create policy "Users can create reviews for other users"
  on public.reviews for insert to authenticated
  with check ((select auth.uid()) = reviewer_id and reviewer_id <> reviewed_user_id);

drop policy if exists "Users can update their own reviews" on public.reviews;
create policy "Users can update their own reviews"
  on public.reviews for update to authenticated
  using ((select auth.uid()) = reviewer_id)
  with check ((select auth.uid()) = reviewer_id);

drop policy if exists "Users can delete their own reviews" on public.reviews;
create policy "Users can delete their own reviews"
  on public.reviews for delete to authenticated
  using ((select auth.uid()) = reviewer_id);

grant select, insert, update, delete on public.listings to authenticated;
grant select, insert, update, delete on public.listing_images to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
revoke all on function public.refresh_profile_rating() from public;
