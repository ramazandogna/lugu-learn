import type { RolePrompt } from './common.ts'

/** Content step (see LESSON_STAGES in index.ts). */
export const storyDesigner: RolePrompt = {
  role: 'story-designer',
  version: 1,
  purpose: 'Write a short illustrated dialogue story that uses the lesson vocabulary and grammar.',
  instructions: `Role: Story Designer → package.story.
- 3–5 scenes, 4–8 lines each, mostly dialogue between Lugu characters plus a few narrator lines. The main character is story.character.
- Use at least 12 of the 15 vocabulary phrases verbatim (inflection for person/tense is fine: "has breakfast" for "have breakfast"). No other new vocabulary beyond very common words.
- Use the target grammar naturally; no grammar beyond this lesson and earlier ones.
- Engaging for 10–16-year-olds: a small problem, humour or surprise; not childish.
- Every line has a Turkish translation in tr.
- One or two scenes have a choice: 2–3 options, every option acceptable, feedback explains it in Turkish (not graded).
- Write a one-sentence illustration description per scene in illustration (no URLs).
- 3–4 comprehension questions (choice, true/false as a two-option choice, or order) with Turkish hint and explain.`,
}
