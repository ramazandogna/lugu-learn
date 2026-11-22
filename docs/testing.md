# Testing

```sh
pnpm check          # type-check, every test project, production build
pnpm test           # all vitest projects
pnpm vitest run --project unit   # domain, engine, design, api helpers, composables (jsdom)
pnpm vitest run --project ai     # AI pipeline with a mocked model client
pnpm vitest run --project db     # migrations, RLS and RPCs on PGlite
```

## What each project covers

- **unit** — grading and normalisation (shared cases with SQL), progression, analytics signals,
  the ported quiz engine (mastery, exam), vocabulary quiz, lesson flow, homework, story,
  assessment, breaks (never auto-continue), activity tracking, the answer write queue, error
  mapping, resume mapping, admin helpers (filters, timeline, attention reasons), design
  wiring (`rei-kit/check` contrast and styling).
- **ai** — a full pipeline run producing a valid package and admin material, repair of invalid
  model output, failure after repeated invalid output, deterministic QA, the revision limit,
  no student names in prompts, insights citing only existing evidence.
- **db** — every migration applies to a Supabase-compatible stub on PGlite; RLS isolation
  between students and between student and admin data; anon has no access; the full learning
  flow (assign → session → mastery → ordered sections → assessment → completion → replay);
  admin progress actions and their history; school dedupe and search; academic net; SQL/TS
  grading parity; seed package validity.

## Not automated yet

- **End-to-end browser tests** against a running Supabase stack. They need Docker and the
  Supabase CLI (`supabase start`); the manual checklist in `docs/deployment.md` §3 covers the
  critical admin and student workflows until a Playwright suite is added.
- **Edge functions under Deno.** Their shared core is tested in Node; the thin Deno adapters
  are verified by `supabase functions serve` locally or a deploy.
