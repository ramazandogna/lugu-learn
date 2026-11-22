/** Prompt registry: every role module, for docs and `ai_jobs.output.promptVersions`. */
import type { RolePrompt } from './common.ts'
import { academicInsight } from './academic-insight.ts'
import { assessmentDesigner } from './assessment-designer.ts'
import { contentIntegrator } from './content-integrator.ts'
import { curriculumAnalyst } from './curriculum-analyst.ts'
import { educationalQa } from './educational-qa.ts'
import { learningDesigner } from './learning-designer.ts'
import { learningProfile } from './learning-profile.ts'
import { lessonDesigner } from './lesson-designer.ts'
import { practiceDesigner } from './practice-designer.ts'
import { revision } from './revision.ts'
import { speakingCoach } from './speaking-coach.ts'
import { storyDesigner } from './story-designer.ts'
import { teacherGuideDesigner } from './teacher-guide-designer.ts'
import { visualAssetPlanner } from './visual-asset-planner.ts'
import { vocabularySpecialist } from './vocabulary-specialist.ts'
import { weeklyReport } from './weekly-report.ts'

export {
  academicInsight,
  assessmentDesigner,
  contentIntegrator,
  curriculumAnalyst,
  educationalQa,
  learningDesigner,
  learningProfile,
  lessonDesigner,
  practiceDesigner,
  revision,
  speakingCoach,
  storyDesigner,
  teacherGuideDesigner,
  visualAssetPlanner,
  vocabularySpecialist,
  weeklyReport,
}
export type { RolePrompt }
export { INSIGHTS_SYSTEM, LESSON_SYSTEM, section } from './common.ts'

/** Lesson pipeline: stage → roles combined into that one model call. */
export const LESSON_STAGES = {
  plan: [curriculumAnalyst, learningDesigner],
  content_core: [vocabularySpecialist, storyDesigner],
  content_practice: [lessonDesigner, practiceDesigner],
  content_assessment: [assessmentDesigner],
  /** Applied to every content step as package rules, and as the merge check in code. */
  integration: [contentIntegrator],
  qa: [educationalQa],
  revision: [revision],
  admin_material: [teacherGuideDesigner, speakingCoach, visualAssetPlanner],
} as const satisfies Record<string, readonly RolePrompt[]>

export const ALL_PROMPTS: readonly RolePrompt[] = [
  curriculumAnalyst,
  learningDesigner,
  vocabularySpecialist,
  storyDesigner,
  lessonDesigner,
  practiceDesigner,
  assessmentDesigner,
  contentIntegrator,
  educationalQa,
  revision,
  speakingCoach,
  teacherGuideDesigner,
  visualAssetPlanner,
  learningProfile,
  weeklyReport,
  academicInsight,
]

export function promptVersions(): Record<string, number> {
  return Object.fromEntries(ALL_PROMPTS.map((p) => [p.role, p.version]))
}

/** Joins role instructions for one combined call. */
export function combine(roles: readonly RolePrompt[]): string {
  return roles.map((r) => r.instructions).join('\n\n')
}
