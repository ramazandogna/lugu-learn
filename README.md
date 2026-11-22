# Lugu

**Lugu — Küçük adımlar, büyük hayaller.**

Lugu is a private English learning and coaching platform for learners aged 10–16, run by a
private English coach. Students follow an individually assigned curriculum through short,
structured lessons in an illustrated world with five original characters; the teacher manages
students, curricula, content, analytics, school exam tracking and weekly speaking sessions from a
professional admin area. AI drafts lesson packages, teacher guides, speaking plans and learning
profiles — the teacher reviews and approves everything before a student sees it.

The interface is Turkish; learning content is English with Turkish support.

## Features

- **Accounts:** no public sign-up. The admin creates students (`LUGU-1042` + temporary password),
  pauses, disables or resets them. Forced password change and profile completion on first login.
- **Curricula:** multiple independent, versioned curricula; ordered lessons with objectives;
  program assignments with a chosen starting lesson; every progress change is logged, nothing
  is deleted.
- **Lessons:** review → vocabulary flashcards → vocabulary mastery quiz (each item twice correct
  since its last miss) → story → explanation → linked homework groups (complete → order →
  meaning) → final assessment (quiz + reading). Server-graded, resumable, replayable.
- **Breaks and focus:** 10/15/20/30-minute breaks with a countdown and an explicit restart;
  friendly leave warnings; active, idle and break time tracked separately, for interpretation
  only, never punishment.
- **Admin:** dashboard of actionable signals, comprehensive student profile with timeline,
  analytics, academic exam tracking with net and trends, speaking sessions with timer and notes,
  school registry with merge, data deletion workflow.
- **AI:** curriculum intake (text, PDF, images) → multi-stage lesson package pipeline with
  deterministic and AI QA and revision → admin approval workflow; teacher guides, speaking plans,
  learning profiles that separate observed data, AI hypotheses and teacher observations.
- **Gamification:** XP, stars and achievements that never decrease; no leaderboards.

## Technology

Vue 3 + TypeScript (strict) + Vite, [rei-kit](https://github.com/ramazandogna/rei-kit) on
Tailwind 4, vue-router, zod. Supabase (Postgres with RLS, Auth, Storage, Edge Functions).
Claude API from edge functions only. Hosting: Vercel + Supabase.

## Architecture

```
src/
  domain/     content schema (zod), grading, progression, analytics — pure
  engine/     quiz engine (mastery, exam) and lesson flows — pure, unit-tested
  design/     Lugu visual layer: tokens, characters, mascots, shells, learning map
  lib/        supabase client, auth, api/{student,admin} (the only data access)
  features/   auth, student, admin views
supabase/
  migrations/ schema `lugu`, RLS, RPCs          functions/  edge functions
tests/db      migrations + RLS + RPCs on PGlite  tests/ai    AI pipeline with a mocked model
```

The rules students depend on — grading, mastery, completion, lesson access — are enforced by
`SECURITY DEFINER` RPCs on the server; the client mirrors them only for instant feedback.

## Documentation

| Topic | File |
| --- | --- |
| Architecture and decisions | [docs/architecture.md](docs/architecture.md) |
| Database, RLS, RPCs, error codes | [docs/database.md](docs/database.md) |
| AI workflow and prompts | [docs/ai-workflow.md](docs/ai-workflow.md), [docs/prompts/](docs/prompts/) |
| Design system and characters | [docs/design/](docs/design/) |
| Deployment | [docs/deployment.md](docs/deployment.md) |
| Security and privacy | [docs/security.md](docs/security.md) |
| Testing | [docs/testing.md](docs/testing.md) |

## Setup

Requires Node ≥ 22.18 and pnpm 10. A local Supabase stack additionally needs Docker and the
Supabase CLI.

```sh
pnpm install
cp .env.example .env.local      # fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
supabase start                  # local Supabase: applies migrations and the demo seed
pnpm dev                        # http://localhost:5173
```

Create the first admin as described in [docs/deployment.md](docs/deployment.md#1-supabase).
`/dev/design` shows the design system gallery in development builds.

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | frontend | Supabase project URL (public) |
| `VITE_SUPABASE_ANON_KEY` | frontend | anon key (public; RLS is the boundary) |
| `ANTHROPIC_API_KEY` | Supabase secret | Claude API, edge functions only |
| `LUGU_AI_MODEL` | Supabase secret | model id, default `claude-opus-5-5` |
| `LUGU_ALLOWED_ORIGINS` | Supabase secret | CORS allow-list for edge functions |

## Development

```sh
pnpm check          # type-check + all tests + build
pnpm test           # unit, ai and db test projects
pnpm test:db        # migrations, RLS and RPCs on an in-process Postgres (PGlite)
```

## Security

Built for minors: no public registration, roles stored in the database (never trusted from the
client), RLS on every table, privileged operations only in edge functions, minimal personal data,
no student names in AI prompts, no student data used for training, audit logs and a deletion
workflow. See [docs/security.md](docs/security.md).

## Demo data

`supabase/seed.sql` contains a clearly marked demo curriculum for development only. It contains no
people and is never applied by `supabase db push`.
