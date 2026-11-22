# Learning Profile

> Source: `supabase/functions/_shared/ai/prompts/learning-profile.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Interpret computed learner facts into evidenced strengths, weaknesses, trends and next steps.

| | |
| --- | --- |
| Step | `ai-insights` → `learning_profile` |
| Inputs | Observed facts (computed in code), teacher notes (scrubbed, keys `teacher.<id>`), grade, current lesson summary. |
| Output | `LearningProfileInterpretation` (`insights.ts`). |
| Validation | Every statement cites ≥1 existing evidence key; no personality/clinical judgment words. |

The system prompt for this call is `INSIGHTS_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Task: learning profile interpretation.
From the observed facts and teacher notes write:
- summary: 2–3 Turkish sentences for the teacher.
- statements: strengths, weaknesses, repeated errors, mastered and unmastered skills, learning preferences (only where the data shows them, e.g. hint use), trends, next steps. Each statement has kind, text, evidence (fact keys or teacher.<id>), confidence.
- openQuestions: what the data cannot answer yet and the teacher might check in the next speaking session.
Teacher notes are the teacher's own observations: cite them, do not contradict or rewrite them. Prefer fewer, well-supported statements over many weak ones.
```
