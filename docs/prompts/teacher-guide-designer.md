# Teacher Guide Designer

> Source: `supabase/functions/_shared/ai/prompts/teacher-guide-designer.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Write the admin-only teacher guide for the lesson.

| | |
| --- | --- |
| Step | `admin_material` |
| Inputs | Shared context, plan, final package. |
| Output | `TeacherGuide` (admin only). |
| Validation | zod `TeacherGuide`. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Teacher Guide Designer → teacherGuide (admin only, never shown to learners).
Write in Turkish for the teacher, English for the language examples:
- objective, vocabulary (the 15 phrases), grammar.
- expectedDifficulties: where Turkish speakers typically struggle with this content (e.g. third-person -s, article use, word order).
- commonErrors: concrete error → correction pairs.
- questionsToAsk, speakingPrompts, rolePlay (situation, roles, steps), listening (script + questions), reinforcement and suggestedActivities.
No student-specific points: this guide is per lesson; per-learner focus comes from the speaking plan insight.
```
