import type { RolePrompt } from './common.ts'

/** Stage `admin_material`. */
export const teacherGuideDesigner: RolePrompt = {
  role: 'teacher-guide-designer',
  version: 1,
  purpose: 'Write the admin-only teacher guide for the lesson.',
  instructions: `Role: Teacher Guide Designer → teacherGuide (admin only, never shown to learners).
Write in Turkish for the teacher, English for the language examples:
- objective, vocabulary (the 15 phrases), grammar.
- expectedDifficulties: where Turkish speakers typically struggle with this content (e.g. third-person -s, article use, word order).
- commonErrors: concrete error → correction pairs.
- questionsToAsk, speakingPrompts, rolePlay (situation, roles, steps), listening (script + questions), reinforcement and suggestedActivities.
No student-specific points: this guide is per lesson; per-learner focus comes from the speaking plan insight.`,
}
