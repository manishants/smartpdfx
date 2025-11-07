-- Blog status enum for review workflow
create type if not exists public.blog_status as enum ('draft','review','published');

-- 1) Blogs table
create table if not exists public.blogs (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  content text not null,
  author text not null,
  date timestamptz not null default now(),
  imageUrl text not null,
  published boolean not null default false,
  -- Review workflow fields
  status public.blog_status not null default 'draft',
  created_by uuid not null default auth.uid() references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  seoTitle text,
  metaDescription text,
  faqs jsonb not null default '[]'::jsonb,
  category text default 'general',
  popular boolean default false,
  layoutSettings jsonb,
  upiId text,
  paypalId text,
  supportQrUrl text,
  supportLabel text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Helpful indexes
create index if not exists blogs_published_idx on public.blogs (published);
create index if not exists blogs_status_idx on public.blogs (status);
create index if not exists blogs_created_by_idx on public.blogs (created_by);
create index if not exists blogs_date_idx on public.blogs (date);

-- 3) Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists blogs_set_updated_at on public.blogs;
create trigger blogs_set_updated_at
before update on public.blogs
for each row execute function public.set_updated_at();

-- 4) Row Level Security (RLS) policies
alter table public.blogs enable row level security;

-- Public read
drop policy if exists "Public read blogs" on public.blogs;
create policy "Public read blogs"
on public.blogs for select
to anon
using (published = true);

-- Authenticated users can read published posts
drop policy if exists "Authenticated read published blogs" on public.blogs;
create policy "Authenticated read published blogs"
on public.blogs for select
to authenticated
using (published = true);

-- Admins and superadmins can read all posts
drop policy if exists "Admins read all blogs" on public.blogs;
create policy "Admins read all blogs"
on public.blogs for select
to authenticated
using (public.is_admin() or public.is_superadmin());

-- 4.a) Triggers to enforce admin review workflow
create or replace function public.blogs_before_insert_enforce()
returns trigger language plpgsql as $$
begin
  -- Ensure created_by is set
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  -- Admin-created posts must start as review and unpublished
  if public.is_admin() then
    new.status := 'review';
    new.published := false;
  end if;
  return new;
end;
$$;

drop trigger if exists blogs_before_insert_enforce on public.blogs;
create trigger blogs_before_insert_enforce
before insert on public.blogs
for each row execute function public.blogs_before_insert_enforce();

create or replace function public.blogs_before_update_enforce()
returns trigger language plpgsql as $$
begin
  -- Admins cannot publish or set status to published; and can only update own posts
  if public.is_admin() then
    if new.published = true or new.status = 'published' then
      raise exception 'Admins cannot publish posts; requires superadmin review.';
    end if;
    if old.created_by <> auth.uid() then
      raise exception 'Admins can only update their own posts.';
    end if;
  end if;

  -- Superadmin publish metadata
  if public.is_superadmin() then
    if new.published = true and new.status = 'published' and old.published = false then
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists blogs_before_update_enforce on public.blogs;
create trigger blogs_before_update_enforce
before update on public.blogs
for each row execute function public.blogs_before_update_enforce();
-- Insert policies
drop policy if exists "Admin insert blogs (goes to review)" on public.blogs;
create policy "Admin insert blogs (goes to review)"
on public.blogs for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Superadmin insert blogs" on public.blogs;
create policy "Superadmin insert blogs"
on public.blogs for insert
to authenticated
with check (public.is_superadmin());

-- Authenticated update
-- Update policies
drop policy if exists "Admin update own non-published blogs" on public.blogs;
create policy "Admin update own non-published blogs"
on public.blogs for update
to authenticated
using (public.is_admin() and created_by = auth.uid())
with check (public.is_admin() and created_by = auth.uid() and published = false and status <> 'published');

drop policy if exists "Superadmin update blogs" on public.blogs;
create policy "Superadmin update blogs"
on public.blogs for update
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

-- Authenticated delete
-- Delete policies
drop policy if exists "Admin delete own non-published blogs" on public.blogs;
create policy "Admin delete own non-published blogs"
on public.blogs for delete
to authenticated
using (public.is_admin() and created_by = auth.uid() and published = false);

drop policy if exists "Superadmin delete blogs" on public.blogs;
create policy "Superadmin delete blogs"
on public.blogs for delete
to authenticated
using (public.is_superadmin());

-- 5) Public Storage bucket for blog images and QR codes
insert into storage.buckets (id, name, public)
values ('blogs', 'blogs', true)
on conflict (id) do nothing;

-- Storage policies for 'blogs' bucket
-- Public read
drop policy if exists "Public read blogs bucket" on storage.objects;
create policy "Public read blogs bucket"
on storage.objects for select
using (bucket_id = 'blogs');

-- Authenticated insert
drop policy if exists "Authenticated insert blogs bucket" on storage.objects;
create policy "Authenticated insert blogs bucket"
on storage.objects for insert
to authenticated
with check (bucket_id = 'blogs' and (public.is_admin() or public.is_superadmin()));

-- Authenticated update
drop policy if exists "Authenticated update blogs bucket" on storage.objects;
create policy "Authenticated update blogs bucket"
on storage.objects for update
to authenticated
using (bucket_id = 'blogs' and (public.is_admin() or public.is_superadmin()))
with check (bucket_id = 'blogs' and (public.is_admin() or public.is_superadmin()));

-- Authenticated delete
drop policy if exists "Authenticated delete blogs bucket" on storage.objects;
create policy "Authenticated delete blogs bucket"
on storage.objects for delete
to authenticated
using (bucket_id = 'blogs' and (public.is_admin() or public.is_superadmin()));

-- 6) Sample insert to validate
insert into public.blogs (
  slug, title, content, author, imageUrl, published,
  status, seoTitle, metaDescription, faqs, category, popular,
  layoutSettings, upiId, paypalId, supportQrUrl, supportLabel
) values (
  'sample-post',
  'Sample Post',
  '<p>Hello from Supabase!</p>',
  'Admin',
  'https://example.com/sample.jpg',
  true,
  'published',
  'Sample Post',
  'A sample post for validation.',
  '[{"question":"What is this?","answer":"A test post."}]'::jsonb,
  'general',
  false,
  '{"showBreadcrumbs": true, "leftSidebarEnabled": true, "rightSidebarEnabled": true}'::jsonb,
  'manishants@ybl',
  'manishants@gmail.com',
  'https://example.com/qr.png',
  'Support The Author'
)
on conflict (slug) do nothing;

-- Done.