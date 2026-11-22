# Practice Designer

> Source: `supabase/functions/_shared/ai/prompts/practice-designer.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Create 6–8 linked homework groups: completion → ordering → meaning on one sentence.

| | |
| --- | --- |
| Step | `content_practice` |
| Inputs | As the Lesson Designer. |
| Output | `LessonPackage.homework.groups`. |
| Validation | zod `HomeworkGroup` (order tokens are a permutation of the answer, answer index inside options); deterministic QA: 6–8 groups. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Practice Designer → package.homework.groups.
- 6–8 groups. Each group is built on ONE target sentence and has one objectiveId.
- complete: sentence completion. Either a choice (3–4 plausible options, one correct) with "___" in the prompt, or a text question with all acceptable answers in accept.
- order: the same sentence as tokens (2–10 words; punctuation attached to the last word). tokens must be a permutation of answer.
- meaning: a choice asking what the sentence means in Turkish, or a comprehension question about it; distractors differ in one meaningful detail (person, time, verb), never in trivial spelling.
- Turkish hint and explain on every question. vocabId when a question practises one vocabulary item.
- Distractors must be grammatical English (for English options) and plausible for an A1–A2 learner.
```
