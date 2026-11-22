# Deployment

Lugu runs on two free-tier-friendly services: **Vercel** (static frontend) and **Supabase**
(Postgres, Auth, Storage, Edge Functions). No other service receives student data except the
Claude API, which is called only from edge functions for content generation and insights.

## 1. Supabase

1. Create a project. Note the project ref, URL and anon key (Settings → API).
2. Dashboard settings (a hosted project does not read `supabase/config.toml`):
   - Auth → Providers → Email: enabled; **Allow new users to sign up: off**; Confirm email: off.
   - Settings → API → Exposed schemas: add `lugu`.
   - Auth → URL configuration: Site URL = your Vercel URL.
3. Apply migrations and deploy functions with the Supabase CLI:

   ```sh
   supabase link --project-ref <ref>
   supabase db push
   supabase functions deploy admin-students process-deletion ai-generate ai-insights
   supabase secrets set \
     LUGU_ALLOWED_ORIGINS=https://your-app.vercel.app \
     ANTHROPIC_API_KEY=sk-ant-... \
     LUGU_AI_MODEL=claude-opus-5-5 \
     LUGU_INTERNAL_SECRET=$(openssl rand -hex 32)
   ```

   Never run `seed.sql` against production: it is development demo content.
4. Create the first admin: Auth → Users → Add user (auto-confirm), then in the SQL editor:

   ```sql
   insert into lugu.profiles (user_id, role) select id, 'admin' from auth.users where email = 'you@example.com';
   ```

## 2. Vercel

1. Import the repository. `vercel.json` sets the build (`pnpm build`), output (`dist`), SPA
   rewrites and security headers.
2. Environment variables (Production and Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Only these two are public. The service role key and `ANTHROPIC_API_KEY` live only in Supabase
   secrets and must never be added to Vercel.
3. Deploy. Without the two variables the app shows a setup notice instead of failing.

## 3. Verify after deploying

- Sign in as admin, create a student (code + temporary password shown once).
- Sign in as the student in a private window: forced password change, then profile completion.
- Assign a curriculum version with a published lesson; open the lesson as the student.
- Confirm `/admin` redirects a student to the student home, and that a direct REST request with
  the anon key to `lugu.student_profiles` returns no rows.

## 4. Updating

`supabase db push` applies new migrations only; migrations are forward-only and never edited
after release. Roll back by writing a new migration. Frontend rollbacks: promote a previous
Vercel deployment.
