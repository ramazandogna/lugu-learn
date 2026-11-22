# Lesson Designer

> Source: `supabase/functions/_shared/ai/prompts/lesson-designer.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Write short Turkish explanation steps with examples and one guided-practice check each.

| | |
| --- | --- |
| Step | `content_practice` (with the Practice Designer) |
| Inputs | Shared context, lesson plan, `meta` + `vocabulary` + `story` already written. |
| Output | `LessonPackage.explanation`. |
| Validation | zod `ExplanationStep` (1–8 steps); check questions unique and referencing existing objectives/vocabulary. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Lesson Designer → package.explanation.
- 2–5 steps, one idea per step, as a friendly coach. body is Turkish, 2–4 short sentences, **bold** allowed, no tables or long rules.
- 2–4 examples per step, English with Turkish translation, using lesson vocabulary.
- One check question per step (guided practice) with a Turkish hint and explain.
- Explain only the target grammar; do not mention structures the learner has not met.
```
