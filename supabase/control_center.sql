-- Bazar Control Center
-- Run after profiles.sql and marketplace.sql.
-- This migration keeps moderation data separate from user-owned marketplace data.

create schema if not exists private;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('USER', 'MEMBER', 'MODERATOR', 'SUPPORT', 'ADMIN'));

create or replace function private.has_staff_role(required_roles text[] default array['ADMIN', 'MODERATOR', 'SUPPORT'])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status <> 'BANNED'
      and p.role = any(required_roles)
  );
$$;

create or replace function private.has_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status <> 'BANNED'
      and p.role = 'ADMIN'
  );
$$;

revoke all on function private.has_staff_role(text[]) from public;
revoke all on function private.has_admin_role() from public;
grant execute on function private.has_staff_role(text[]) to authenticated;
grant execute on function private.has_admin_role() to authenticated;

create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('LISTING', 'USER', 'CONVERSATION', 'CONTENT')),
  reporter_id uuid references public.profiles(id) on delete set null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  reason text not null,
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  status text not null default 'OPEN' check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
  assigned_to uuid references public.profiles(id) on delete set null,
  resolution_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create index if not exists moderation_reports_status_idx on public.moderation_reports(status, created_at desc);
create index if not exists moderation_reports_reported_user_idx on public.moderation_reports(reported_user_id, created_at desc);
create index if not exists moderation_reports_assigned_idx on public.moderation_reports(assigned_to, status, created_at desc);

create table if not exists public.user_warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  issued_by uuid not null references public.profiles(id) on delete restrict,
  report_id uuid references public.moderation_reports(id) on delete set null,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  internal_note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_warnings_user_idx on public.user_warnings(user_id, created_at desc);

create table if not exists public.user_suspensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  issued_by uuid not null references public.profiles(id) on delete restrict,
  report_id uuid references public.moderation_reports(id) on delete set null,
  starts_at timestamptz not null default timezone('utc', now()),
  ends_at timestamptz,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint suspension_end_after_start check (ends_at is null or ends_at > starts_at)
);

create index if not exists user_suspensions_user_idx on public.user_suspensions(user_id, starts_at desc);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete set null,
  requester_name text not null check (char_length(btrim(requester_name)) between 1 and 160),
  requester_email text not null check (char_length(btrim(requester_email)) between 3 and 320),
  subject text not null check (char_length(btrim(subject)) between 1 and 200),
  message text not null check (char_length(btrim(message)) between 1 and 10000),
  status text not null default 'NEW' check (status in ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create index if not exists support_tickets_status_idx on public.support_tickets(status, created_at desc);
create index if not exists support_tickets_assigned_idx on public.support_tickets(assigned_to, status, created_at desc);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  is_internal boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id, created_at asc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_target_idx on public.audit_logs(target_type, target_id, created_at desc);

create or replace function public.set_control_center_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_moderation_reports_updated_at on public.moderation_reports;
create trigger set_moderation_reports_updated_at
before update on public.moderation_reports
for each row execute procedure public.set_control_center_updated_at();

drop trigger if exists set_support_tickets_updated_at on public.support_tickets;
create trigger set_support_tickets_updated_at
before update on public.support_tickets
for each row execute procedure public.set_control_center_updated_at();

create or replace function public.submit_support_ticket(
  p_name text,
  p_email text,
  p_subject text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  ticket_id uuid;
begin
  if char_length(btrim(p_name)) not between 1 and 160
     or char_length(btrim(p_email)) not between 3 and 320
     or char_length(btrim(p_subject)) not between 1 and 200
     or char_length(btrim(p_message)) not between 1 and 10000 then
    raise exception 'Ungültige Support-Anfrage';
  end if;

  insert into public.support_tickets (requester_id, requester_name, requester_email, subject, message)
  values ((select auth.uid()), btrim(p_name), lower(btrim(p_email)), btrim(p_subject), btrim(p_message))
  returning id into ticket_id;

  return ticket_id;
end;
$$;

create or replace function public.moderation_warn_user(
  p_user_id uuid,
  p_reason text,
  p_internal_note text default null,
  p_report_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  warning_id uuid;
begin
  if not private.has_staff_role(array['ADMIN', 'MODERATOR']) then
    raise exception 'Keine Berechtigung';
  end if;

  insert into public.user_warnings (user_id, issued_by, report_id, reason, internal_note)
  values (p_user_id, (select auth.uid()), p_report_id, btrim(p_reason), p_internal_note)
  returning id into warning_id;

  update public.profiles set status = 'WARNED' where id = p_user_id and status <> 'BANNED';
  insert into public.audit_logs (actor_id, action, target_type, target_id, reason, metadata)
  values ((select auth.uid()), 'USER_WARNED', 'USER', p_user_id, p_reason, jsonb_build_object('report_id', p_report_id));
  return warning_id;
end;
$$;

create or replace function public.moderation_suspend_user(
  p_user_id uuid,
  p_ends_at timestamptz,
  p_reason text,
  p_report_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  suspension_id uuid;
begin
  if not private.has_staff_role(array['ADMIN', 'MODERATOR']) then
    raise exception 'Keine Berechtigung';
  end if;
  if p_ends_at <= timezone('utc', now()) then
    raise exception 'Das Sperrende muss in der Zukunft liegen';
  end if;

  insert into public.user_suspensions (user_id, issued_by, report_id, ends_at, reason)
  values (p_user_id, (select auth.uid()), p_report_id, p_ends_at, btrim(p_reason))
  returning id into suspension_id;

  update public.profiles set status = 'TEMPORARILY_SUSPENDED' where id = p_user_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, reason, metadata)
  values ((select auth.uid()), 'USER_SUSPENDED', 'USER', p_user_id, p_reason, jsonb_build_object('report_id', p_report_id, 'ends_at', p_ends_at));
  return suspension_id;
end;
$$;

create or replace function public.moderation_ban_user(
  p_user_id uuid,
  p_reason text,
  p_report_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.has_admin_role() then
    raise exception 'Nur Administratoren dürfen dauerhaft sperren';
  end if;

  update public.profiles set status = 'BANNED' where id = p_user_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, reason, metadata)
  values ((select auth.uid()), 'USER_BANNED', 'USER', p_user_id, p_reason, jsonb_build_object('report_id', p_report_id));
end;
$$;

create or replace function public.admin_soft_delete_user(p_user_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.has_admin_role() then
    raise exception 'Nur Administratoren dürfen Accounts deaktivieren';
  end if;

  update public.profiles set status = 'BANNED' where id = p_user_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, reason)
  values ((select auth.uid()), 'USER_SOFT_DELETED', 'USER', p_user_id, p_reason);
end;
$$;

create or replace function public.moderation_update_report(
  p_report_id uuid,
  p_status text,
  p_note text default null,
  p_assigned_to uuid default null
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.has_staff_role() then
    raise exception 'Keine Berechtigung';
  end if;
  if p_status not in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') then
    raise exception 'Ungültiger Meldungsstatus';
  end if;

  update public.moderation_reports
  set status = p_status,
      resolution_note = coalesce(p_note, resolution_note),
      assigned_to = coalesce(p_assigned_to, assigned_to),
      resolved_at = case when p_status in ('RESOLVED', 'REJECTED') then timezone('utc', now()) else null end
  where id = p_report_id;

  insert into public.audit_logs (actor_id, action, target_type, target_id, reason, metadata)
  values ((select auth.uid()), 'REPORT_UPDATED', 'REPORT', p_report_id, p_note, jsonb_build_object('status', p_status));
end;
$$;

create or replace function public.admin_set_profile_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.has_admin_role() then
    raise exception 'Nur Administratoren dürfen Rollen ändern';
  end if;
  if p_role not in ('USER', 'MEMBER', 'MODERATOR', 'SUPPORT', 'ADMIN') then
    raise exception 'Ungültige Rolle';
  end if;

  update public.profiles set role = p_role where id = p_user_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'ROLE_CHANGED', 'USER', p_user_id, jsonb_build_object('role', p_role));
end;
$$;

create or replace function public.admin_update_listing_status(p_listing_id uuid, p_status text, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.has_staff_role(array['ADMIN', 'MODERATOR']) then
    raise exception 'Keine Berechtigung';
  end if;
  if p_status not in ('ACTIVE', 'REJECTED', 'BLOCKED', 'DELETED') then
    raise exception 'Ungültiger Inseratsstatus';
  end if;

  update public.listings set status = p_status, moderation_reason = p_reason where id = p_listing_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, reason)
  values ((select auth.uid()), 'LISTING_STATUS_CHANGED', 'LISTING', p_listing_id, p_reason, jsonb_build_object('status', p_status));
end;
$$;

create or replace function public.audit_support_ticket_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status or old.assigned_to is distinct from new.assigned_to then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (
      (select auth.uid()),
      'SUPPORT_TICKET_UPDATED',
      'SUPPORT_TICKET',
      new.id,
      jsonb_build_object('status', new.status, 'assigned_to', new.assigned_to)
    );
  end if;
  return new;
end;
$$;

create or replace function public.audit_support_message_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (
    coalesce(new.sender_id, (select auth.uid())),
    'SUPPORT_TICKET_REPLIED',
    'SUPPORT_TICKET',
    new.ticket_id,
    jsonb_build_object('message_id', new.id, 'is_internal', new.is_internal)
  );
  return new;
end;
$$;

drop trigger if exists audit_support_ticket_change on public.support_tickets;
create trigger audit_support_ticket_change
after update on public.support_tickets
for each row execute procedure public.audit_support_ticket_change();

drop trigger if exists audit_support_message_created on public.support_messages;
create trigger audit_support_message_created
after insert on public.support_messages
for each row execute procedure public.audit_support_message_created();

alter table public.moderation_reports enable row level security;
alter table public.user_warnings enable row level security;
alter table public.user_suspensions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Staff can view all profiles" on public.profiles;
create policy "Staff can view all profiles" on public.profiles for select to authenticated
using ((select private.has_staff_role()));

drop policy if exists "Staff can view all listings" on public.listings;
create policy "Staff can view all listings" on public.listings for select to authenticated
using ((select private.has_staff_role()));

drop policy if exists "Staff can view all listing images" on public.listing_images;
create policy "Staff can view all listing images" on public.listing_images for select to authenticated
using ((select private.has_staff_role()));

drop policy if exists "Staff can view all conversations" on public.conversations;
create policy "Staff can view all conversations" on public.conversations for select to authenticated
using ((select private.has_staff_role()));

drop policy if exists "Staff can view all messages" on public.messages;
create policy "Staff can view all messages" on public.messages for select to authenticated
using ((select private.has_staff_role()));

drop policy if exists "Users can create moderation reports" on public.moderation_reports;
create policy "Users can create moderation reports" on public.moderation_reports for insert to authenticated
with check (reporter_id = (select auth.uid()));
drop policy if exists "Users can view own moderation reports" on public.moderation_reports;
create policy "Users can view own moderation reports" on public.moderation_reports for select to authenticated
using (reporter_id = (select auth.uid()) or (select private.has_staff_role()));
drop policy if exists "Staff can update moderation reports" on public.moderation_reports;
create policy "Staff can update moderation reports" on public.moderation_reports for update to authenticated
using ((select private.has_staff_role())) with check ((select private.has_staff_role()));

drop policy if exists "Staff can view warnings" on public.user_warnings;
create policy "Staff can view warnings" on public.user_warnings for select to authenticated
using ((select private.has_staff_role()));
drop policy if exists "Users can view own warnings" on public.user_warnings;
create policy "Users can view own warnings" on public.user_warnings for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Staff can view suspensions" on public.user_suspensions;
create policy "Staff can view suspensions" on public.user_suspensions for select to authenticated
using ((select private.has_staff_role()));

drop policy if exists "Staff can view support tickets" on public.support_tickets;
create policy "Staff can view support tickets" on public.support_tickets for select to authenticated
using ((select private.has_staff_role()) or requester_id = (select auth.uid()));
drop policy if exists "Staff can update support tickets" on public.support_tickets;
create policy "Staff can update support tickets" on public.support_tickets for update to authenticated
using ((select private.has_staff_role())) with check ((select private.has_staff_role()));

drop policy if exists "Staff can view support messages" on public.support_messages;
create policy "Staff can view support messages" on public.support_messages for select to authenticated
using ((select private.has_staff_role()));
drop policy if exists "Staff can create support messages" on public.support_messages;
create policy "Staff can create support messages" on public.support_messages for insert to authenticated
with check ((select private.has_staff_role()) and sender_id = (select auth.uid()));

drop policy if exists "Staff can view audit logs" on public.audit_logs;
create policy "Staff can view audit logs" on public.audit_logs for select to authenticated
using ((select private.has_staff_role()));

create or replace function public.mirror_chat_report_to_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.moderation_reports (source, reporter_id, reported_user_id, conversation_id, reason, description, status, created_at)
  values ('CONVERSATION', new.reporter_id, new.reported_user_id, new.conversation_id, new.reason, new.description, new.status, new.created_at)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists mirror_chat_report_to_moderation on public.chat_reports;
create trigger mirror_chat_report_to_moderation
after insert on public.chat_reports
for each row execute procedure public.mirror_chat_report_to_moderation();

revoke all on function public.mirror_chat_report_to_moderation() from public;
revoke all on function public.set_control_center_updated_at() from public;
revoke all on function public.submit_support_ticket(text, text, text, text) from public;
revoke all on function public.moderation_warn_user(uuid, text, text, uuid) from public;
revoke all on function public.moderation_suspend_user(uuid, timestamptz, text, uuid) from public;
revoke all on function public.moderation_ban_user(uuid, text, uuid) from public;
revoke all on function public.admin_soft_delete_user(uuid, text) from public;
revoke all on function public.moderation_update_report(uuid, text, text, uuid) from public;
revoke all on function public.admin_set_profile_role(uuid, text) from public;
revoke all on function public.admin_update_listing_status(uuid, text, text) from public;
revoke all on function public.audit_support_ticket_change() from public;
revoke all on function public.audit_support_message_created() from public;

grant execute on function public.submit_support_ticket(text, text, text, text) to anon, authenticated;
grant execute on function public.moderation_warn_user(uuid, text, text, uuid) to authenticated;
grant execute on function public.moderation_suspend_user(uuid, timestamptz, text, uuid) to authenticated;
grant execute on function public.moderation_ban_user(uuid, text, uuid) to authenticated;
grant execute on function public.admin_soft_delete_user(uuid, text) to authenticated;
grant execute on function public.moderation_update_report(uuid, text, text, uuid) to authenticated;
grant execute on function public.admin_set_profile_role(uuid, text) to authenticated;
grant execute on function public.admin_update_listing_status(uuid, text, text) to authenticated;

grant select on public.moderation_reports, public.user_warnings, public.user_suspensions, public.support_tickets, public.support_messages, public.audit_logs to authenticated;
grant select on public.listing_images to authenticated;
grant insert on public.moderation_reports to authenticated;
grant update (status, resolution_note, assigned_to, resolved_at) on public.moderation_reports to authenticated;
grant update (status, assigned_to, resolved_at) on public.support_tickets to authenticated;
grant insert on public.support_messages to authenticated;
grant update (status) on public.profiles to authenticated;
grant update (status, moderation_reason) on public.listings to authenticated;

-- New support tickets are visible in Realtime for staff inbox refreshes.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'moderation_reports') then
    alter publication supabase_realtime add table public.moderation_reports;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_tickets') then
    alter publication supabase_realtime add table public.support_tickets;
  end if;
end;
$$;
