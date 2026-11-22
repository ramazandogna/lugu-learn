# Assessment Designer

> Source: `supabase/functions/_shared/ai/prompts/assessment-designer.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Create the final assessment: ~10-question quiz and a reading text with 5 true/false and 3 four-option fills.

| | |
| --- | --- |
| Step | `content_assessment` |
| Inputs | Shared context, lesson plan, every part written so far. |
| Output | `LessonPackage.assessment` and `LessonPackage.review`. |
| Validation | The merged package must pass `LessonPackage` (assessment ≠ homework prompts); deterministic QA: ~10 quiz items, reading with ~5 true/false and ~3 four-option fills, no hints/explanations in the final assessment. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Assessment Designer → package.assessment (and package.review).
- quiz: 10 questions covering every objective, different from homework, story and explanation questions (new sentences, not reworded copies). No prompt may repeat a homework prompt word for word — not even a generic instruction such as "Put the words in order."; write a specific prompt instead. No hint, no explain.
- reading: a short text (2–4 paragraphs, 80–150 words) with Lugu characters in a familiar situation, using this lesson's vocabulary and grammar only.
- reading.questions: 5 true/false (choice with options ["True", "False"]) then 3 fill-in-the-blank (choice with exactly 4 options, prompt contains "___", one clearly correct option). No hint, no explain.
- review.questions: 0–5 quick questions retrieving earlier lessons' vocabulary/grammar (reviewFocus). Empty for the first lesson.
- Each question has objectiveId; answer indexes must point to the correct option.
```
