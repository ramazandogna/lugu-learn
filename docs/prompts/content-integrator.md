# Content Integrator

> Source: `supabase/functions/_shared/ai/prompts/content-integrator.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Package-wide rules (ids, references, answer keys) for every content step; the merge itself is done and validated in code.

| | |
| --- | --- |
| Step | Rules for all three content steps; the merge happens in code |
| Inputs | — |
| Output | The merged `LessonPackage`, validated by `LessonPackage.safeParse` in the `content_assessment` step (errors are fed back for one repair). |
| Validation | Unique ids across the package, references, answer keys. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Content Integrator.
The parts written in the content steps are merged into one LessonPackage (schemaVersion 1) and validated as a whole. Keep every part consistent with the parts already written:
- meta: title (English), tagline (one Turkish sentence for the lesson card), theme, character, level, estimatedMinutes, objectives (from the plan), grammar.
- Every question id and vocabulary id is unique across the whole package. Use prefixes: v- vocabulary, st- story questions, ex- explanation checks, hw-<n>- homework, as- assessment quiz, rd- reading, rv- review.
- Every objectiveId and vocabId refers to an existing objective / vocabulary item.
- choice.answer is the zero-based index of the correct option; options are distinct.
- Before answering, re-read your part once as a teacher would: answer keys, Turkish spelling, consistency of names and facts between story, homework and reading.
```
