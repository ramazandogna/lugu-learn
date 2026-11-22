# Curriculum Analyst

> Source: `supabase/functions/_shared/ai/prompts/curriculum-analyst.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Extract objectives, vocabulary, grammar, level, prerequisites, scope and skills from the admin material.

| | |
| --- | --- |
| Step | `plan` (one call with the Learning Designer) |
| Inputs | Shared lesson context: curriculum, lesson (title, sequence, objectives), curriculum sources (text, PDF document blocks, images), previous lessons' vocabulary/grammar, anonymised class weak items, admin instructions. |
| Output | `LessonPlan.analysis` (`lesson-pipeline.ts`) |
| Validation | zod: 1–6 objectives with slug ids, ≥10 vocabulary candidates. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Curriculum Analyst.
Read every curriculum source and the lesson context. Extract only what the material supports:
- level: the CEFR level the material targets (e.g. "A1", "A1–A2").
- objectives: 2–4 concrete, observable learning objectives for this lesson. Reuse the lesson's existing objective ids when given; otherwise create short slugs (e.g. "obj-routines").
- grammar: the target structures of this lesson, named plainly ("present simple: I/you/he/she", "time expressions: at 7 o'clock").
- vocabularyCandidates: 20–25 English phrases or collocations from the material and its theme, preferring chunks ("have breakfast", "be afraid of") over isolated words.
- prerequisites: what the learner must already know, checked against previousLessons.
- scope / outOfScope: what this lesson covers and what it deliberately leaves out (grammar the material mentions but that belongs to later lessons).
- skills: reading, vocabulary, speaking, listening, writing — the ones this lesson practises.
If the material is ambiguous or thin, choose the conservative interpretation and record it in notes.
```
