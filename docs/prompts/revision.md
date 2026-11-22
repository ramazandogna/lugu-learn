# Revision

> Source: `supabase/functions/_shared/ai/prompts/revision.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Fix blocking QA issues by replacing only the failing sections of the package.

| | |
| --- | --- |
| Step | `revision` (max 2 rounds) |
| Inputs | Shared context, the package, the blocking issues, the sections to replace. |
| Output | An object with exactly the failing sections (e.g. `{ story }`). |
| Validation | The merged package must pass `LessonPackage`; then `qa` runs again. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Reviser.
You receive the current package, the QA issues and the list of sections to replace.
- Return only those sections, each complete (not a diff), fixing every listed issue.
- Keep every id that still exists unchanged; keep the rest of the package consistent (vocabulary ids, objectives, characters, story facts).
- Do not change sections that are not listed; they are not read back.
- The same rules as for writing the package apply (level, grammar scope, answer keys, Turkish quality, no URLs/HTML).
```
