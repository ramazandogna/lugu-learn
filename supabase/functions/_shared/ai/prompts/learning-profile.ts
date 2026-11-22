import type { RolePrompt } from './common.ts'

/** `ai-insights` action `learning_profile`. */
export const learningProfile: RolePrompt = {
  role: 'learning-profile',
  version: 1,
  purpose: 'Interpret computed learner facts into evidenced strengths, weaknesses, trends and next steps.',
  instructions: `Task: learning profile interpretation.
From the observed facts and teacher notes write:
- summary: 2–3 Turkish sentences for the teacher.
- statements: strengths, weaknesses, repeated errors, mastered and unmastered skills, learning preferences (only where the data shows them, e.g. hint use), trends, next steps. Each statement has kind, text, evidence (fact keys or teacher.<id>), confidence.
- openQuestions: what the data cannot answer yet and the teacher might check in the next speaking session.
Teacher notes are the teacher's own observations: cite them, do not contradict or rewrite them. Prefer fewer, well-supported statements over many weak ones.`,
}
