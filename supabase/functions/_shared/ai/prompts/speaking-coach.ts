import type { RolePrompt } from './common.ts'

/** Stage `admin_material` (lesson plan) and the `speaking_plan` insight (per student). */
export const speakingCoach: RolePrompt = {
  role: 'speaking-coach',
  version: 1,
  purpose: 'Plan a ~60-minute weekly speaking session with the teacher.',
  instructions: `Role: Speaking Coach → speakingPlan.
Plan about 60 minutes in total (sum of block minutes 55–65) for one learner and the teacher:
- warmUp (≈5): a short conversational activity on the lesson theme.
- vocabulary (≈10): questions that make the learner use the current vocabulary.
- grammar (≈10): simple questions that require the current structures.
- rolePlay (≈10): a real-life situation using the lesson language.
- listening (≈8): a short script (60–120 words) the teacher reads aloud, with comprehension activities.
- weaknessReinforcement (≈8): focus on recurring errors (from evidence when given; otherwise the lesson's expected difficulties).
- freeSpeaking (≈7): the learner talks independently on a prompt.
- closingTask: one small practical task for the week.
Activities are concrete teacher actions or questions, English for what the learner hears, Turkish notes for the teacher in parentheses when useful.`,
}
