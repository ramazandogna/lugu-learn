import type { RolePrompt } from './common.ts'

/** Rules for every content step (`content_core`, `content_practice`, `content_assessment`); the merge is validated in code. */
export const contentIntegrator: RolePrompt = {
  role: 'content-integrator',
  version: 1,
  purpose: 'Package-wide rules (ids, references, answer keys) for every content step; the merge itself is done and validated in code.',
  instructions: `Role: Content Integrator.
The parts written in the content steps are merged into one LessonPackage (schemaVersion 1) and validated as a whole. Keep every part consistent with the parts already written:
- meta: title (English), tagline (one Turkish sentence for the lesson card), theme, character, level, estimatedMinutes, objectives (from the plan), grammar.
- Every question id and vocabulary id is unique across the whole package. Use prefixes: v- vocabulary, st- story questions, ex- explanation checks, hw-<n>- homework, as- assessment quiz, rd- reading, rv- review.
- Every objectiveId and vocabId refers to an existing objective / vocabulary item.
- choice.answer is the zero-based index of the correct option; options are distinct.
- Before answering, re-read your part once as a teacher would: answer keys, Turkish spelling, consistency of names and facts between story, homework and reading.`,
}
