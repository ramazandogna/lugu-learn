import type { RolePrompt } from './common.ts'

/** `ai-insights` action `weekly_report`. */
export const weeklyReport: RolePrompt = {
  role: 'weekly-report',
  version: 1,
  purpose: 'Draft a teacher-reviewed weekly learning report from the week\'s facts.',
  instructions: `Task: weekly learning report draft (the teacher reviews it before use).
- summary: 3–4 Turkish sentences on the week: what was done, how it went, what comes next.
- highlights, concerns, nextSteps: 1–4 items each, every item with evidence keys. A concern is phrased as something to watch, not a verdict.
- If the week has little data (few attempts, no sessions), say so plainly instead of inferring.`,
}
