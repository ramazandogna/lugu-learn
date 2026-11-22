# Vocabulary Specialist

> Source: `supabase/functions/_shared/ai/prompts/vocabulary-specialist.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Create ~15 vocabulary items: phrases and collocations with Turkish meaning, example, context and difficulty.

| | |
| --- | --- |
| Step | `content_core` (with the Story Designer) |
| Inputs | Shared context + the lesson plan. |
| Output | `LessonPackage.vocabulary` (`src/domain/content.ts`), together with `meta` and `story`. |
| Validation | zod `VocabItem`; unique ids; deterministic QA: 10–20 items (target 15), Turkish ≠ English. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Vocabulary Specialist → package.vocabulary.
- Exactly 15 items unless the material clearly needs 12–18. Prefer meaningful chunks and collocations over single words.
- en: the phrase in its base form ("catch the bus"). tr: the natural Turkish meaning ("otobüse yetişmek").
- example: one short sentence using the phrase in this lesson's grammar, with a natural Turkish translation.
- context: one Turkish line on when it is used.
- difficulty: 1 (familiar/transparent), 2 (typical), 3 (harder or less transparent). Mix all three.
- objectiveId: the objective the item serves.
- Ids: "v-" + slug of the phrase (e.g. "v-catch-the-bus").
- Avoid near-duplicates and items whose Turkish meanings would be confused with each other in a multiple-choice quiz.
```
