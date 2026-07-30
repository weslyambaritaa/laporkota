-- LaporKota database schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'Warga',
  role text not null default 'warga' check (role in ('warga', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- SECURITY: role is never taken from client-supplied signup metadata.
-- Anyone can call the public Supabase Auth signUp endpoint (the anon key is
-- public by design) with an arbitrary `data.role` payload, so trusting it
-- here would let any visitor self-promote to admin. New accounts are always
-- created as 'warga'; promotion to admin must be done manually in the
-- Supabase dashboard/SQL editor (see README).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Warga'),
    'warga'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SECURITY: "profiles_update_own" above lets a user UPDATE their own row,
-- but RLS alone cannot express "any column except role". Without this
-- trigger, a logged-in warga could call
-- `supabase.from('profiles').update({ role: 'admin' }).eq('id', myId)`
-- directly and silently become an admin. This trigger hard-blocks any role
-- change that wasn't made by an existing admin.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- auth.uid() is null for direct SQL (Supabase SQL Editor / service_role),
  -- which is how the first admin is bootstrapped per the README — that
  -- trusted path is intentionally exempt. Only API-authenticated callers
  -- (auth.uid() present) are blocked from self-promoting.
  if new.role is distinct from old.role and auth.uid() is not null then
    if not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Tidak diizinkan mengubah role.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute procedure public.protect_profile_role();

-- ============================================================
-- 2. REPORTS
-- ============================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Length caps prevent abuse (multi-megabyte text blobs) since these
  -- fields are inserted directly from the browser and only bounded
  -- client-side otherwise.
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 3000),
  photo_url text,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  address text check (address is null or char_length(address) <= 500),
  category text not null default 'lainnya'
    check (category in ('jalan', 'sampah', 'penerangan', 'drainase', 'fasilitas_umum', 'lainnya')),
  urgency text not null default 'sedang'
    check (urgency in ('rendah', 'sedang', 'tinggi')),
  ai_reasoning text,
  status text not null default 'diterima'
    check (status in ('diterima', 'diproses', 'selesai', 'ditolak')),
  upvote_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_user_id_idx on public.reports (user_id);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

alter table public.reports enable row level security;

-- Public transparency: anyone (including anonymous visitors) can view reports on the map.
drop policy if exists "reports_select_all" on public.reports;
create policy "reports_select_all" on public.reports
  for select using (true);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = user_id);

-- Owners can edit their own report only while it has not been processed yet;
-- admins can update any report (e.g. to change status).
drop policy if exists "reports_update_own_or_admin" on public.reports;
create policy "reports_update_own_or_admin" on public.reports
  for update using (
    (auth.uid() = user_id and status = 'diterima')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Owners can delete their own report only while it has not been processed
-- yet (mirrors reports_update_own_or_admin above); admins can delete any.
drop policy if exists "reports_delete_admin" on public.reports;
drop policy if exists "reports_delete_own_or_admin" on public.reports;
create policy "reports_delete_own_or_admin" on public.reports
  for delete using (
    (auth.uid() = user_id and status = 'diterima')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
  before update on public.reports
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- 3. REPORT STATUS HISTORY (auto-logged on every status change)
-- ============================================================
create table if not exists public.report_status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  status text not null check (status in ('diterima', 'diproses', 'selesai', 'ditolak')),
  note text,
  changed_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.report_status_history enable row level security;

drop policy if exists "history_select_all" on public.report_status_history;
create policy "history_select_all" on public.report_status_history
  for select using (true);

drop policy if exists "history_insert_admin" on public.report_status_history;
create policy "history_insert_admin" on public.report_status_history
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    or auth.uid() = changed_by
  );

create or replace function public.log_report_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into public.report_status_history (report_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists reports_log_status_insert on public.reports;
create trigger reports_log_status_insert
  after insert on public.reports
  for each row execute procedure public.log_report_status_change();

drop trigger if exists reports_log_status_update on public.reports;
create trigger reports_log_status_update
  after update on public.reports
  for each row execute procedure public.log_report_status_change();

-- ============================================================
-- 4. UPVOTES
-- ============================================================
create table if not exists public.report_upvotes (
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

alter table public.report_upvotes enable row level security;

drop policy if exists "upvotes_select_all" on public.report_upvotes;
create policy "upvotes_select_all" on public.report_upvotes
  for select using (true);

drop policy if exists "upvotes_insert_own" on public.report_upvotes;
create policy "upvotes_insert_own" on public.report_upvotes
  for insert with check (auth.uid() = user_id);

drop policy if exists "upvotes_delete_own" on public.report_upvotes;
create policy "upvotes_delete_own" on public.report_upvotes
  for delete using (auth.uid() = user_id);

create or replace function public.sync_upvote_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.reports set upvote_count = upvote_count + 1 where id = new.report_id;
  elsif (tg_op = 'DELETE') then
    update public.reports set upvote_count = greatest(upvote_count - 1, 0) where id = old.report_id;
  end if;
  return null;
end;
$$;

drop trigger if exists upvotes_after_insert on public.report_upvotes;
create trigger upvotes_after_insert
  after insert on public.report_upvotes
  for each row execute procedure public.sync_upvote_count();

drop trigger if exists upvotes_after_delete on public.report_upvotes;
create trigger upvotes_after_delete
  after delete on public.report_upvotes
  for each row execute procedure public.sync_upvote_count();

-- ============================================================
-- 5. STORAGE (report photos)
-- ============================================================
-- SECURITY: file_size_limit + allowed_mime_types stop resource-exhaustion
-- abuse (repeated huge uploads) at the storage layer, not just in the UI.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-photos', 'report-photos', true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "report_photos_public_read" on storage.objects;
create policy "report_photos_public_read" on storage.objects
  for select using (bucket_id = 'report-photos');

drop policy if exists "report_photos_authenticated_insert" on storage.objects;
create policy "report_photos_authenticated_insert" on storage.objects
  for insert with check (
    bucket_id = 'report-photos' and auth.role() = 'authenticated'
  );

-- ============================================================
-- 6. REALTIME
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reports'
  ) then
    alter publication supabase_realtime add table public.reports;
  end if;
end $$;

-- With the default REPLICA IDENTITY, Postgres only includes primary-key
-- columns in the "old" row of an UPDATE's logical-replication payload — so
-- Supabase Realtime's `payload.old` arrives with every other column
-- (including status) as undefined. NotificationBell.tsx compares
-- payload.old.status to payload.new.status to decide whether to notify;
-- with old.status always undefined, that comparison never matches and it
-- fires a false "status changed" toast on ANY update to the row (e.g. an
-- upvote incrementing upvote_count). FULL replica identity sends the
-- complete old row so the comparison reflects reality.
alter table public.reports replica identity full;

-- ============================================================
-- 7. RESOLUTION VERIFICATION (community QA on "selesai" reports)
-- ============================================================
-- Without this, an admin could mark any report "selesai" unilaterally with
-- no independent check that the problem was actually fixed. Citizens near
-- a resolved report can confirm or dispute it; enough disputes reopen it.
create table if not exists public.report_resolution_confirmations (
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  confirmed boolean not null,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

alter table public.report_resolution_confirmations enable row level security;

drop policy if exists "resolution_select_all" on public.report_resolution_confirmations;
create policy "resolution_select_all" on public.report_resolution_confirmations
  for select using (true);

-- Can only vote on reports that are actually marked "selesai" — voting on
-- an in-progress report wouldn't mean anything.
drop policy if exists "resolution_insert_own" on public.report_resolution_confirmations;
create policy "resolution_insert_own" on public.report_resolution_confirmations
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.reports r where r.id = report_id and r.status = 'selesai'
    )
  );

drop policy if exists "resolution_update_own" on public.report_resolution_confirmations;
create policy "resolution_update_own" on public.report_resolution_confirmations
  for update using (auth.uid() = user_id);

drop policy if exists "resolution_delete_own" on public.report_resolution_confirmations;
create policy "resolution_delete_own" on public.report_resolution_confirmations
  for delete using (auth.uid() = user_id);

-- Auto-reopen: once 2 or more citizens dispute a "selesai" report, flip it
-- back to 'diproses' so an admin has to re-examine it. Threshold of 2
-- keeps a single bad-faith dispute from reopening a genuinely fixed report.
create or replace function public.reopen_disputed_reports()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  dispute_count integer;
  target_report_id uuid := coalesce(new.report_id, old.report_id);
begin
  select count(*) into dispute_count
  from public.report_resolution_confirmations
  where report_id = target_report_id and confirmed = false;

  if dispute_count >= 2 then
    update public.reports
    set status = 'diproses'
    where id = target_report_id and status = 'selesai';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists resolution_reopen_on_change on public.report_resolution_confirmations;
create trigger resolution_reopen_on_change
  after insert or update on public.report_resolution_confirmations
  for each row execute procedure public.reopen_disputed_reports();
