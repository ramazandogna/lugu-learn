# Security and privacy

Lugu's learners are minors. These are the decisions that protect them, and where each is enforced.

## Access control

- **No public registration.** Sign-up is disabled in Auth; only the `admin-students` edge function
  (service role, admin caller verified against the database) creates accounts.
- **Roles come from the database.** `lugu.profiles.role` is read by `lugu.is_admin()` and
  `lugu.current_student_id()`. JWT claims and the role the UI reads are never trusted for
  authorisation; the UI uses the role only to choose a layout.
- **RLS on every table.** Students select only their own rows; admin-only tables (admin
  material, AI jobs, learning profiles, reports, speaking notes, audit logs) have no student
  policy at all. `anon` has no access.
- **Learning state changes only through RPCs.** Students cannot insert or update attempts,
  mastery, rewards, completions or assignments directly. `SECURITY DEFINER` functions check the
  caller, account status, ownership of the session and assignment, and lesson availability, with
  `search_path = ''`; `EXECUTE` is revoked from `public` and `anon`.
- **Server-side grading.** The final assessment's answer keys never reach the student client;
  every answer is graded and recorded by the server. Answer writes are idempotent on a
  client-generated id, so a retried request cannot count twice.
- **Inactive accounts.** Pausing or disabling a student bans the Auth user; the client also signs
  out an account whose status is not active.

## Secrets

- The frontend holds only the Supabase URL and anon key, which are public by design.
- The service role key, `ANTHROPIC_API_KEY` and `LUGU_INTERNAL_SECRET` exist only as Supabase
  secrets, read by edge functions.
- `.env*` (except `.env.example`), `.team/`, dumps and reports are gitignored.

## Data minimisation

- Collected: names, display name, grade, school, a drawn avatar. No photos, birth dates,
  addresses, phone numbers or emails for students (their login address is a synthetic
  `.invalid` address).
- Focus tracking records only in-page signals (tab visibility, fullscreen exit, idle time,
  breaks). It does not claim to detect screenshots or other devices, and it is presented to the
  teacher as context, never as a verdict.
- AI prompts contain no student names or personal data — only ids and aggregated learning
  facts (`tests/ai` checks this). Student data is not used for model training; requests go to
  the Claude API under its standard data terms.
- AI insights are labelled as observations or hypotheses with their evidence; observed data,
  AI interpretation and teacher observations are stored separately.

## Content safety

- No `v-html`: AI and admin text is rendered as text. Package text is validated by zod and by
  deterministic QA (no URLs or HTML) before an admin can approve it.
- AI content is never student-visible until an admin publishes it.

## Audit and deletion

- Admin actions on students, programs and content write `admin_audit_logs`; progress changes are
  appended to `program_events`, never deleted.
- A data deletion request is approved by the admin and carried out by `process-deletion`, which
  requires the student code as confirmation and deletes the Auth user; dependent rows cascade.

## Transport and hosting

`vercel.json` sets `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy, a restrictive
permissions policy and `noindex`. Edge functions answer CORS only for `LUGU_ALLOWED_ORIGINS`.
