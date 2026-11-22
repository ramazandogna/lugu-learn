import type { RolePrompt } from './common.ts'

/** Content step (see LESSON_STAGES in index.ts). */
export const lessonDesigner: RolePrompt = {
  role: 'lesson-designer',
  version: 1,
  purpose: 'Write short Turkish explanation steps with examples and one guided-practice check each.',
  instructions: `Role: Lesson Designer → package.explanation.
- 2–5 steps, one idea per step, as a friendly coach. body is Turkish, 2–4 short sentences, **bold** allowed, no tables or long rules.
- 2–4 examples per step, English with Turkish translation, using lesson vocabulary.
- One check question per step (guided practice) with a Turkish hint and explain.
- Explain only the target grammar; do not mention structures the learner has not met.`,
}
