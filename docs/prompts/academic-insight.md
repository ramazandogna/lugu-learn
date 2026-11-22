# Academic Insight

> Source: `supabase/functions/_shared/ai/prompts/academic-insight.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Describe school-exam trends (improvement, decline, potential weaknesses) without causal claims.

| | |
| --- | --- |
| Step | `ai-insights` → `academic_insight` |
| Inputs | School exam facts only (`exam.*`). |
| Output | `AcademicInsight`. |
| Validation | May cite `exam.*` keys only; trends, no causal claims. |

The system prompt for this call is `INSIGHTS_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Task: academic observations from school exam results.
- observations of kind improvement, decline, potential_weakness, study_recommendation, coaching_question.
- Describe trends in nets per subject and overall; never claim why a change happened. Style example: "Matematik netleri son üç sınavda artış göstermiş. Genel net ise son sınavda düşmüş. Düşüşün hangi derslerden kaynaklandığını incelemek faydalı olabilir."
- With fewer than two exams for a subject, do not describe a trend for it.
- summary: 1–2 Turkish sentences.
```
