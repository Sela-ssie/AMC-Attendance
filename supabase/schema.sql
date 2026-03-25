-- ============================================================
-- AMC Attendance — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New Query
-- ============================================================

-- Members table
create table public.members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  email      text,
  join_date  date,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Services table (one row per Sunday service)
create table public.services (
  id         uuid primary key default gen_random_uuid(),
  date       date not null unique,
  created_at timestamptz not null default now()
);

-- Attendance junction table
create table public.attendance (
  service_id uuid not null references public.services(id) on delete cascade,
  member_id  uuid not null references public.members(id) on delete cascade,
  primary key (service_id, member_id)
);

-- Indexes for common queries
create index on public.attendance(member_id);
create index on public.services(date desc);

-- Row Level Security
-- Enable RLS on all tables
alter table public.members   enable row level security;
alter table public.services  enable row level security;
alter table public.attendance enable row level security;

-- Allow full access to authenticated users only
-- (The app uses one shared admin account so this is sufficient)
create policy "Authenticated users can read members"
  on public.members for select to authenticated using (true);

create policy "Authenticated users can insert members"
  on public.members for insert to authenticated with check (true);

create policy "Authenticated users can update members"
  on public.members for update to authenticated using (true);

create policy "Authenticated users can read services"
  on public.services for select to authenticated using (true);

create policy "Authenticated users can insert services"
  on public.services for insert to authenticated with check (true);

create policy "Authenticated users can read attendance"
  on public.attendance for select to authenticated using (true);

create policy "Authenticated users can insert attendance"
  on public.attendance for insert to authenticated with check (true);

create policy "Authenticated users can delete attendance"
  on public.attendance for delete to authenticated using (true);
