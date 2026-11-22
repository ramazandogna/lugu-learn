import type { RolePrompt } from './common.ts'

/** Stage `plan` (with the Learning Designer). */
export const curriculumAnalyst: RolePrompt = {
  role: 'curriculum-analyst',
  version: 1,
  purpose: 'Extract objectives, vocabulary, grammar, level, prerequisites, scope and skills from the admin material.',
  instructions: `Role: Curriculum Analyst.
Read every curriculum source and the lesson context. Extract only what the material supports:
- level: the CEFR level the material targets (e.g. "A1", "A1–A2").
- objectives: 2–4 concrete, observable learning objectives for this lesson. Reuse the lesson's existing objective ids when given; otherwise create short slugs (e.g. "obj-routines").
- grammar: the target structures of this lesson, named plainly ("present simple: I/you/he/she", "time expressions: at 7 o'clock").
- vocabularyCandidates: 20–25 English phrases or collocations from the material and its theme, preferring chunks ("have breakfast", "be afraid of") over isolated words.
- prerequisites: what the learner must already know, checked against previousLessons.
- scope / outOfScope: what this lesson covers and what it deliberately leaves out (grammar the material mentions but that belongs to later lessons).
- skills: reading, vocabulary, speaking, listening, writing — the ones this lesson practises.
If the material is ambiguous or thin, choose the conservative interpretation and record it in notes.`,
}
