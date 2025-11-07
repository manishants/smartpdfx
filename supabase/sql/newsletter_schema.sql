-- Newsletter subscribers schema
-- Run after roles_policies.sql

create table if not exists public.newsletter_subscribers (
  id bigserial primary key,
  email text not null,
  category text not null default 'general',
  unsubscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, category)
);

create index if not exists newsletter_email_idx on public.newsletter_subscribers(email);
create index if not exists newsletter_category_idx on public.newsletter_subscribers(category);
create index if not exists newsletter_created_at_idx on public.newsletter_subscribers(created_at);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists newsletter_set_updated_at on public.newsletter_subscribers;
create trigger newsletter_set_updated_at
before update on public.newsletter_subscribers
for each row execute function public.set_updated_at();

-- RLS policies
alter table public.newsletter_subscribers enable row level security;

-- Public insert
drop policy if exists "Public insert newsletter subscribers" on public.newsletter_subscribers;
create policy "Public insert newsletter subscribers"
on public.newsletter_subscribers for insert
to anon, authenticated
with check (true);

-- Admin/Superadmin read all
drop policy if exists "Admins read newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins read newsletter subscribers"
on public.newsletter_subscribers for select
to authenticated
using (public.is_admin() or public.is_superadmin());

-- Admin/Superadmin update
drop policy if exists "Admins update newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins update newsletter subscribers"
on public.newsletter_subscribers for update
to authenticated
using (public.is_admin() or public.is_superadmin())
with check (public.is_admin() or public.is_superadmin());

-- Admin/Superadmin delete
drop policy if exists "Admins delete newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins delete newsletter subscribers"
on public.newsletter_subscribers for delete
to authenticated
using (public.is_admin() or public.is_superadmin());

-- Done.