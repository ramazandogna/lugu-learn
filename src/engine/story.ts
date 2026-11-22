/**
 * The story section: scenes, an in-story choice per scene where present, then
 * comprehension questions.
 *
 * Rules:
 * - Scenes are read in order; a scene with a choice cannot be left until a
 *   choice is made. Choices are not graded: every option is acceptable and
 *   returns its feedback. The student may change it while on that scene.
 * - Comprehension questions are practice: hints and explanations are allowed,
 *   a wrong answer may be retried, and the student may move on after any answer.
 * - The story is completed when every scene has been passed and every
 *   question answered at least once.
 */
import { z } from 'zod'

import type { LessonPackage } from '@/domain/content'
import { gradeResponse } from '@/domain/grading'

type StoryContent = LessonPackage['story']

export interface QuestionStats {
  attempts: number
  correct: boolean
  hintUsed: boolean
}

export interface StoryRun {
  story: StoryContent
  phase: 'scenes' | 'questions' | 'done'
  scene: number
  /** sceneId → chosen option index. */
  choices: Record<string, number>
  question: number
  stats: Record<string, QuestionStats>
  hintShown: boolean
}

export function startStory(pkg: Pick<LessonPackage, 'story'>): StoryRun {
  return {
    story: pkg.story,
    phase: 'scenes',
    scene: 0,
    choices: {},
    question: 0,
    stats: Object.fromEntries(pkg.story.questions.map((q) => [q.id, { attempts: 0, correct: false, hintUsed: false }])),
    hintShown: false,
  }
}

export const currentScene = (r: StoryRun) => (r.phase === 'scenes' ? (r.story.scenes[r.scene] ?? null) : null)
export const currentStoryQuestion = (r: StoryRun) => (r.phase === 'questions' ? (r.story.questions[r.question] ?? null) : null)

/** Make the in-story choice of the current scene. Returns its feedback, or null when there is no choice. */
export function chooseInScene(r: StoryRun, option: number): string | null {
  const sc = currentScene(r)
  const opt = sc?.choice?.options[option]
  if (!sc || !opt) return null
  r.choices[sc.id] = option
  return opt.feedback
}

/** Whether the student may leave the current scene. */
export function canAdvanceScene(r: StoryRun): boolean {
  const sc = currentScene(r)
  return !!sc && (!sc.choice || r.choices[sc.id] !== undefined)
}

/** Next scene, or into the questions after the last one. False when blocked. */
export function advanceScene(r: StoryRun): boolean {
  if (!canAdvanceScene(r)) return false
  if (r.scene + 1 < r.story.scenes.length) r.scene++
  else r.phase = 'questions'
  return true
}

/** Back one scene (re-reading is allowed). */
export function backScene(r: StoryRun): boolean {
  if (r.phase === 'questions' && r.question === 0) {
    r.phase = 'scenes'
    r.scene = r.story.scenes.length - 1
    return true
  }
  if (r.phase !== 'scenes' || r.scene === 0) return false
  r.scene--
  return true
}

/** Reveal the current question's hint; null when it has none. */
export function revealStoryHint(r: StoryRun): string | null {
  const q = currentStoryQuestion(r)
  const st = q && r.stats[q.id]
  if (!q?.hint || !st) return null
  st.hintUsed = true
  r.hintShown = true
  return q.hint
}

export interface StoryAnswer {
  questionId: string
  correct: boolean
  attemptNo: number
  hintUsed: boolean
  explain: string | null
}

/** Answer the current comprehension question (it stays current so a retry is possible). */
export function answerStoryQuestion(r: StoryRun, response: unknown): StoryAnswer | null {
  const q = currentStoryQuestion(r)
  const st = q && r.stats[q.id]
  if (!q || !st) return null
  const correct = gradeResponse(q, response)
  st.attempts++
  st.correct ||= correct
  const hintUsed = r.hintShown
  r.hintShown = false
  return { questionId: q.id, correct, attemptNo: st.attempts, hintUsed, explain: q.explain ?? null }
}

/** Move to the next question once the current one has been answered; past the last one the story is done. */
export function nextStoryQuestion(r: StoryRun): boolean {
  const q = currentStoryQuestion(r)
  if (!q || !r.stats[q.id]?.attempts) return false
  r.hintShown = false
  if (r.question + 1 < r.story.questions.length) r.question++
  else if (isStoryComplete(r)) r.phase = 'done'
  else r.question = r.story.questions.findIndex((x) => !r.stats[x.id]?.attempts)
  return true
}

export const isStoryComplete = (r: StoryRun) =>
  r.story.questions.every((q) => (r.stats[q.id]?.attempts ?? 0) > 0) &&
  r.story.scenes.every((sc) => !sc.choice || r.choices[sc.id] !== undefined)

/* ── snapshot / restore ───────────────────────────────────────────────── */

const Count = z.number().int().nonnegative()
export const StorySnapshot = z.object({
  v: z.literal(1),
  sceneIds: z.array(z.string()),
  questionIds: z.array(z.string()),
  phase: z.enum(['scenes', 'questions', 'done']),
  scene: Count,
  choices: z.record(z.string(), Count),
  question: Count,
  stats: z.record(z.string(), z.object({ attempts: Count, correct: z.boolean(), hintUsed: z.boolean() })),
})
export type StorySnapshot = z.infer<typeof StorySnapshot>

export const snapshotStory = (r: StoryRun): StorySnapshot => ({
  v: 1,
  sceneIds: r.story.scenes.map((s) => s.id),
  questionIds: r.story.questions.map((q) => q.id),
  phase: r.phase,
  scene: r.scene,
  choices: { ...r.choices },
  question: r.question,
  stats: structuredClone(r.stats),
})

/** Resume, or a fresh start when the snapshot is malformed or belongs to another story. Never throws. */
export function restoreStory(snapshot: unknown, pkg: Pick<LessonPackage, 'story'>): StoryRun {
  const parsed = StorySnapshot.safeParse(snapshot)
  if (!parsed.success) return startStory(pkg)
  const s = parsed.data
  const { scenes, questions } = pkg.story
  const sameIds = (a: string[], b: { id: string }[]) => a.length === b.length && b.every((x, i) => x.id === a[i])
  const ok =
    sameIds(s.sceneIds, scenes) &&
    sameIds(s.questionIds, questions) &&
    s.scene < scenes.length &&
    s.question < questions.length &&
    questions.every((q) => s.stats[q.id]) &&
    Object.entries(s.choices).every(([id, i]) => (scenes.find((sc) => sc.id === id)?.choice?.options.length ?? 0) > i)
  if (!ok) return startStory(pkg)
  return { story: pkg.story, phase: s.phase, scene: s.scene, choices: s.choices, question: s.question, stats: s.stats, hintShown: false }
}
