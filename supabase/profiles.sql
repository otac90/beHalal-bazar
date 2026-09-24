-- Run this once in Supabase Dashboard -> SQL Editor.
-- Auth credentials remain in auth.users; public profile data lives here.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  bio text,
  avatar_url text not null default '/assets/default-avatar.svg',
  phone text,
  country text not null default 'Österreich',
  postal_code text not null default '',
  city text not null default '',
  language text not null default 'de' check (language in ('de', 'en')),
  role text not null default 'MEMBER' check (role in ('USER', 'MEMBER', 'MODERATOR', 'ADMIN')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'WARNED', 'TEMPORARILY_SUSPENDED', 'BANNED')),
  rating_average numeric(3, 2) not null default 0 check (rating_average between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

update public.profiles
set avatar_url = '/assets/default-avatar.svg'
where avatar_url is null;

alter table public.profiles
  alter column avatar_url set default '/assets/default-avatar.svg',
  alter column avatar_url set not null;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, first_name, last_name, postal_code, city)
  values (
    new.id,
    lower(coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substr(replace(new.id::text, '-', ''), 1, 12))),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'postal_code', ''),
    coalesce(new.raw_user_meta_data ->> 'city', '')
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_profiles_updated_at();

grant select on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (first_name, last_name, bio, avatar_url, phone, postal_code, city, language)
  on public.profiles to authenticated;
