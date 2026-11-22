import type { RolePrompt } from './common.ts'

/** Content step (see LESSON_STAGES in index.ts). */
export const practiceDesigner: RolePrompt = {
  role: 'practice-designer',
  version: 1,
  purpose: 'Create 6–8 linked homework groups: completion → ordering → meaning on one sentence.',
  instructions: `Role: Practice Designer → package.homework.groups.
- 6–8 groups. Each group is built on ONE target sentence and has one objectiveId.
- complete: sentence completion. Either a choice (3–4 plausible options, one correct) with "___" in the prompt, or a text question with all acceptable answers in accept.
- order: the same sentence as tokens (2–10 words; punctuation attached to the last word). tokens must be a permutation of answer.
- meaning: a choice asking what the sentence means in Turkish, or a comprehension question about it; distractors differ in one meaningful detail (person, time, verb), never in trivial spelling.
- Turkish hint and explain on every question. vocabId when a question practises one vocabulary item.
- Distractors must be grammatical English (for English options) and plausible for an A1–A2 learner.`,
}
