import type { RolePrompt } from './common.ts'

/** `ai-insights` action `academic_insight`. */
export const academicInsight: RolePrompt = {
  role: 'academic-insight',
  version: 1,
  purpose: 'Describe school-exam trends (improvement, decline, potential weaknesses) without causal claims.',
  instructions: `Task: academic observations from school exam results.
- observations of kind improvement, decline, potential_weakness, study_recommendation, coaching_question.
- Describe trends in nets per subject and overall; never claim why a change happened. Style example: "Matematik netleri son üç sınavda artış göstermiş. Genel net ise son sınavda düşmüş. Düşüşün hangi derslerden kaynaklandığını incelemek faydalı olabilir."
- With fewer than two exams for a subject, do not describe a trend for it.
- summary: 1–2 Turkish sentences.`,
}
