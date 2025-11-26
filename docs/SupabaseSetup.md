# Supabase Setup for SmartPDFx

Follow these steps to enable posting with Supabase.

## 1) Get your Supabase URL and Keys

- Open your Supabase project dashboard.
- Go to `Settings` → `API`.
- Copy `Project URL` and paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`.
- Copy `anon public` key and paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Do NOT expose the `service_role` key to the browser. It is server-only.

Example `.env.local` entries:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

## 2) Create role-based schema (profiles, roles, policies)

- In Supabase, open `SQL Editor`.
- Create a new query and paste the contents of `supabase/sql/roles_policies.sql`.
- Click `Run` to create:
  - Enums: `user_role` (`superadmin`,`admin`,`user`) and `user_type` (`ad_free`,`ai_limit_reach`)
  - `profiles` table linked to `auth.users`
  - Helper functions: `is_admin()`, `is_superadmin()`
  - RLS policies to allow:
    - Users to read/update their own profile
    - Admins/Superadmins to read all profiles
    - Superadmin to change `role`
    - Admin to set `user_type` for `role = 'user'`

## 3) Create the Blogs table and Storage bucket (with review workflow)

- In Supabase, open `SQL Editor`.
- Create a new query and paste the contents of `supabase/sql/blogs_schema.sql`.
- Click `Run` to create the `blogs` table, indexes, triggers, RLS policies, and a public `blogs` storage bucket.
- Review workflow enforced:
  - Admin inserts automatically set `status='review'` and `published=false`
  - Admin can update or delete only their own non-published posts
  - Superadmin can publish (`status='published'`, `published=true`), which records `reviewed_by` and `reviewed_at`
  - Public and authenticated non-admins see only `published=true` posts

## 4) Create Comments table and policies

- In `SQL Editor`, paste and run `supabase/sql/comments_schema.sql`.
- Behavior:
  - Anyone can submit comments (`anon` insert allowed)
  - Comments with links are auto-flagged as `spam`
  - Public can only read `approved` comments
  - Admin/Superadmin can read all, approve, mark spam, or delete

## 5) Enable Email Authentication (for Admin Login)

- Go to `Authentication` → `Providers` → enable `Email`.
- Optional (dev only): disable email confirmation under `Authentication` → `Auth Settings` to simplify testing.
- Ensure `Site URL` points to your dev or prod domain for magic links.

## 6) Add environment variables locally

- Create `.env.local` in the project root if not present.
- Add the two Supabase variables (see step 1 above).
- Restart your dev server after changes.

## 7) Start posting from the Admin UI

- Run the dev server: `npm run dev`.
- Visit `/admin/login` and sign in with your Supabase email/password.
- Go to `/admin/blog/new` to create posts.
- Uploaded images will go into the `blogs` bucket. Ensure the bucket is public.

## Notes

- If you see an error like `The "blogs" table does not exist`, re-run the SQL from `supabase/sql/blogs_schema.sql` (after `roles_policies.sql`).
- Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` up-to-date with your project.
- Never publish `SUPABASE_SERVICE_ROLE_KEY` to the client or version control.