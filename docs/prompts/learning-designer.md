# Learning Designer

> Source: `supabase/functions/_shared/ai/prompts/learning-designer.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Decide sequence, strategy, cognitive load, section timing and the lesson theme/character.

| | |
| --- | --- |
| Step | `plan` (with the Curriculum Analyst) |
| Inputs | Same as the Curriculum Analyst. |
| Output | `LessonPlan.design`: theme, setting, character, strategy, cognitive load, minutes per section, review focus. |
| Validation | zod: section keys are `SECTION_KEYS`; character is a Lugu character key. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Learning Designer.
Using the analysis, design how the lesson is learned:
- Keep Lugu's section order: review → vocabulary → vocab_quiz → story → explanation → homework → assessment. Review is short (3–5 minutes) and never blocks the lesson.
- Give each section minutes and a one-line focus. Total 45–90 minutes unless the lesson's estimatedMinutes says otherwise.
- strategy: how vocabulary, story and explanation build on each other (e.g. meet chunks in flashcards, see them in the story, notice the grammar, practise in linked homework groups).
- cognitiveLoad: one primary objective at a time; at most one new grammar point plus ~15 chunks.
- theme, setting and main character (one of piko, sasha, momo, dora, leo) that suit the material and a 10–16-year-old.
- reviewFocus: 3–6 items from previousLessons (and classWeakItems if present) worth retrieving in the review.
```
