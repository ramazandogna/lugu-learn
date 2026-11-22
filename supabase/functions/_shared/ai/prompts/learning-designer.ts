import type { RolePrompt } from './common.ts'

/** Stage `plan` (with the Curriculum Analyst). */
export const learningDesigner: RolePrompt = {
  role: 'learning-designer',
  version: 1,
  purpose: 'Decide sequence, strategy, cognitive load, section timing and the lesson theme/character.',
  instructions: `Role: Learning Designer.
Using the analysis, design how the lesson is learned:
- Keep Lugu's section order: review → vocabulary → vocab_quiz → story → explanation → homework → assessment. Review is short (3–5 minutes) and never blocks the lesson.
- Give each section minutes and a one-line focus. Total 45–90 minutes unless the lesson's estimatedMinutes says otherwise.
- strategy: how vocabulary, story and explanation build on each other (e.g. meet chunks in flashcards, see them in the story, notice the grammar, practise in linked homework groups).
- cognitiveLoad: one primary objective at a time; at most one new grammar point plus ~15 chunks.
- theme, setting and main character (one of piko, sasha, momo, dora, leo) that suit the material and a 10–16-year-old.
- reviewFocus: 3–6 items from previousLessons (and classWeakItems if present) worth retrieving in the review.`,
}
