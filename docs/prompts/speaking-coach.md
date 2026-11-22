# Speaking Coach

> Source: `supabase/functions/_shared/ai/prompts/speaking-coach.ts` · version 1. Edit the module first, then this page: `tests/ai/prompt-docs.test.ts` fails when the two drift.

**Purpose.** Plan a ~60-minute weekly speaking session with the teacher.

| | |
| --- | --- |
| Step | `admin_material` (per lesson) and the `speaking_plan` insight (per learner) |
| Inputs | Lesson: plan + package. Insight: observed facts, scrubbed teacher notes, current lesson summary and teacher guide difficulties. |
| Output | `SpeakingPlan` (`content.ts`); for the insight `SpeakingPlanDraft` (`insights.ts`) with evidenced `focus`. |
| Validation | Block minutes sum to 50–70; insight `focus` cites existing evidence keys. |

The system prompt for this call is `LESSON_SYSTEM` (`prompts/common.ts`); every structured call also receives the JSON Schema of its output through `output_config.format`.

## Instructions

```text
Role: Speaking Coach → speakingPlan.
Plan about 60 minutes in total (sum of block minutes 55–65) for one learner and the teacher:
- warmUp (≈5): a short conversational activity on the lesson theme.
- vocabulary (≈10): questions that make the learner use the current vocabulary.
- grammar (≈10): simple questions that require the current structures.
- rolePlay (≈10): a real-life situation using the lesson language.
- listening (≈8): a short script (60–120 words) the teacher reads aloud, with comprehension activities.
- weaknessReinforcement (≈8): focus on recurring errors (from evidence when given; otherwise the lesson's expected difficulties).
- freeSpeaking (≈7): the learner talks independently on a prompt.
- closingTask: one small practical task for the week.
Activities are concrete teacher actions or questions, English for what the learner hears, Turkish notes for the teacher in parentheses when useful.
```
