-- Blog comments schema with moderation workflow
-- Run after roles_policies.sql and blogs_schema.sql

do $$ begin
  if not exists (select 1 from pg_type where typname = 'comment_status') then
    create type public.comment_status as enum ('pending','spam','approved');
  end if;
end $$;

-- 2) Comments table
create table if not exists public.blog_comments (
  id bigserial primary key,
  blog_slug text not null references public.blogs(slug) on delete cascade,
  name text not null,
  email text not null,
  content text not null,
  link_url text,
  status public.comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_comments_slug_idx on public.blog_comments(blog_slug);
create index if not exists blog_comments_status_idx on public.blog_comments(status);
create index if not exists blog_comments_created_at_idx on public.blog_comments(created_at);

-- 3) updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists blog_comments_set_updated_at on public.blog_comments;
create trigger blog_comments_set_updated_at
before update on public.blog_comments
for each row execute function public.set_updated_at();

-- 4) Spam detection helper and triggers
create or replace function public.comment_contains_link(txt text)
returns boolean language sql stable as $$
  select case when txt is null then false else txt ~* '((https?:\/\/)|www\.)' end;
$$;

create or replace function public.blog_comments_before_insert_enforce()
returns trigger language plpgsql as $$
begin
  -- Auto-mark spam if link exists in field or content
  if (new.link_url is not null and length(new.link_url) > 0) or public.comment_contains_link(new.content) then
    new.status := 'spam';
  else
    new.status := coalesce(new.status, 'pending');
  end if;
  return new;
end;
$$;

drop trigger if exists blog_comments_before_insert_enforce on public.blog_comments;
create trigger blog_comments_before_insert_enforce
before insert on public.blog_comments
for each row execute function public.blog_comments_before_insert_enforce();

create or replace function public.blog_comments_before_update_enforce()
returns trigger language plpgsql as $$
begin
  -- Only admin/superadmin can change status; public cannot.
  if not (public.is_admin() or public.is_superadmin()) then
    if new.status <> old.status then
      raise exception 'Only admin or superadmin may change comment status';
    end if;
  end if;

  -- If content now contains a link, force spam unless superadmin overrides to approved
  if public.comment_contains_link(new.content) or (new.link_url is not null and length(new.link_url) > 0) then
    if public.is_superadmin() then
      -- superadmin may approve explicitly; otherwise fall through
      null;
    else
      new.status := 'spam';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists blog_comments_before_update_enforce on public.blog_comments;
create trigger blog_comments_before_update_enforce
before update on public.blog_comments
for each row execute function public.blog_comments_before_update_enforce();

-- 5) RLS policies
alter table public.blog_comments enable row level security;

-- Public read: only approved comments
drop policy if exists "Public read approved comments" on public.blog_comments;
create policy "Public read approved comments"
on public.blog_comments for select
to anon
using (status = 'approved');

drop policy if exists "Authenticated read approved comments" on public.blog_comments;
create policy "Authenticated read approved comments"
on public.blog_comments for select
to authenticated
using (status = 'approved');

-- Admins and superadmins can read all
drop policy if exists "Admins read all comments" on public.blog_comments;
create policy "Admins read all comments"
on public.blog_comments for select
to authenticated
using (public.is_admin() or public.is_superadmin());

-- Public insert: allow anyone to post comments
drop policy if exists "Public insert comments" on public.blog_comments;
create policy "Public insert comments"
on public.blog_comments for insert
to anon, authenticated
with check (true);

-- Moderation update/delete: admin or superadmin only
drop policy if exists "Admin update comments" on public.blog_comments;
create policy "Admin update comments"
on public.blog_comments for update
to authenticated
using (public.is_admin() or public.is_superadmin())
with check (public.is_admin() or public.is_superadmin());

drop policy if exists "Admin delete comments" on public.blog_comments;
create policy "Admin delete comments"
on public.blog_comments for delete
to authenticated
using (public.is_admin() or public.is_superadmin());

-- Done.