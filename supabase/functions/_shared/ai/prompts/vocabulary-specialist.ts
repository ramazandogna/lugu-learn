import type { RolePrompt } from './common.ts'

/** Content step (see LESSON_STAGES in index.ts). */
export const vocabularySpecialist: RolePrompt = {
  role: 'vocabulary-specialist',
  version: 1,
  purpose: 'Create ~15 vocabulary items: phrases and collocations with Turkish meaning, example, context and difficulty.',
  instructions: `Role: Vocabulary Specialist → package.vocabulary.
- Exactly 15 items unless the material clearly needs 12–18. Prefer meaningful chunks and collocations over single words.
- en: the phrase in its base form ("catch the bus"). tr: the natural Turkish meaning ("otobüse yetişmek").
- example: one short sentence using the phrase in this lesson's grammar, with a natural Turkish translation.
- context: one Turkish line on when it is used.
- difficulty: 1 (familiar/transparent), 2 (typical), 3 (harder or less transparent). Mix all three.
- objectiveId: the objective the item serves.
- Ids: "v-" + slug of the phrase (e.g. "v-catch-the-bus").
- Avoid near-duplicates and items whose Turkish meanings would be confused with each other in a multiple-choice quiz.`,
}
