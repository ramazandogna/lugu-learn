# Weekly Report

> Source: `supabase/functions/_shared/ai/prompts/weekly-report.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Draft a teacher-reviewed weekly learning report from the week's facts.

| | |
| --- | --- |
| Step | `ai-insights` → `weekly_report` |
| Inputs | Facts for the week window, teacher notes of the week. |
| Output | `WeeklyReport`. |
| Validation | As the learning profile; a reviewed report is never overwritten. |

The system prompt for this call is `INSIGHTS_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Task: weekly learning report draft (the teacher reviews it before use).
- summary: 3–4 Turkish sentences on the week: what was done, how it went, what comes next.
- highlights, concerns, nextSteps: 1–4 items each, every item with evidence keys. A concern is phrased as something to watch, not a verdict.
- If the week has little data (few attempts, no sessions), say so plainly instead of inferring.
```
