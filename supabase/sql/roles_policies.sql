-- Role-based auth schema for SmartPDFx
-- Paste this file into Supabase SQL Editor and run BEFORE blogs_schema.sql

-- 1) Role and user-type enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('superadmin','admin','user');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_type') then
    create type public.user_type as enum ('ad_free','ai_limit_reach');
  end if;
end $$;

-- 2) Common updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 3) Profiles table mapped to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  website text,
  avatar_url text,
  role public.user_role not null default 'user',
  user_type public.user_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_user_type_idx on public.profiles(user_type);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 4) Helper functions to check current user's role
create or replace function public.has_role(target_role public.user_role)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = target_role
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select public.has_role('admin');
$$;

create or replace function public.is_superadmin()
returns boolean language sql stable as $$
  select public.has_role('superadmin');
$$;

-- 5) Prevent non-superadmin role changes in profiles
create or replace function public.profiles_enforce_role_changes()
returns trigger language plpgsql as $$
begin
  -- Allow superadmin to change roles; block others
  if new.role <> old.role then
    if not public.is_superadmin() then
      raise exception 'Only superadmin can change profile role';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_illegal_role_changes on public.profiles;
create trigger profiles_prevent_illegal_role_changes
before update on public.profiles
for each row execute function public.profiles_enforce_role_changes();

-- 6) Row Level Security (RLS) for profiles
alter table public.profiles enable row level security;

-- Read own profile
drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

-- Admins and superadmins can read all profiles
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin() or public.is_superadmin());

-- Update own profile (non-role fields)
drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Superadmin can insert and update any profile
drop policy if exists "Superadmin insert profiles" on public.profiles;
create policy "Superadmin insert profiles"
on public.profiles for insert
to authenticated
with check (public.is_superadmin());

drop policy if exists "Superadmin update profiles" on public.profiles;
create policy "Superadmin update profiles"
on public.profiles for update
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

-- Admin can update user_type for users (role must remain 'user')
drop policy if exists "Admin update user_type for users" on public.profiles;
create policy "Admin update user_type for users"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin() and role = 'user');

-- Note: Creating auth.users accounts requires service role API; this schema governs metadata and access.

-- Done.