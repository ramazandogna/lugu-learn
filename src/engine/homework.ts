/**
 * Homework: linked question groups, each worked through in three stages on
 * one sentence — complete → order → meaning.
 *
 * Rules:
 * - Stages run in that order inside a group, groups in package order.
 * - A wrong answer keeps the student on that stage (retry); the stage counts
 *   attempts, errors and hint use.
 * - A stage is solved once it has been answered correctly; a group is done
 *   when all three stages are solved. Homework is done when every group is.
 * - Grading here is for instant feedback; the server grades again in `record_answer`.
 */
import { z } from 'zod'

import type { LessonPackage, Question } from '@/domain/content'
import { gradeResponse } from '@/domain/grading'

import type { Rng } from './mastery'
import { matchesTokens, newOrderState, OrderStateSchema, orderResponse, type OrderState } from './order'

export const HOMEWORK_STAGES = ['complete', 'order', 'meaning'] as const
export type HomeworkStage = (typeof HOMEWORK_STAGES)[number]

type Group = LessonPackage['homework']['groups'][number]

export interface StageStats {
  attempts: number
  errors: number
  hintsUsed: number
  /** Sum of client-measured response times, ms. */
  ms: number
  solved: boolean
}

export interface Homework {
  groups: Group[]
  stats: Record<string, Record<HomeworkStage, StageStats>>
  /** Null when every group is done. */
  current: { group: number; stage: HomeworkStage } | null
  /** Hint revealed on the current stage since its last answer. */
  hintShown: boolean
  /** Tap-to-place state when the current stage is `order`. */
  order: OrderState | null
}

const emptyStats = (): StageStats => ({ attempts: 0, errors: 0, hintsUsed: 0, ms: 0, solved: false })

function firstOpen(hw: Pick<Homework, 'groups' | 'stats'>): Homework['current'] {
  for (const [group, g] of hw.groups.entries()) {
    const stage = HOMEWORK_STAGES.find((st) => !hw.stats[g.id]?.[st].solved)
    if (stage) return { group, stage }
  }
  return null
}

/** The question on screen, or null when done. */
export function currentQuestion(hw: Homework): Question | null {
  if (!hw.current) return null
  const g = hw.groups[hw.current.group]
  return g ? g[hw.current.stage] : null
}

function enterCurrent(hw: Homework, rng: Rng) {
  hw.hintShown = false
  const q = currentQuestion(hw)
  hw.order = q?.type === 'order' ? newOrderState(q.tokens, rng, q.answer) : null
}

export function startHomework(pkg: Pick<LessonPackage, 'homework'>, rng: Rng): Homework {
  const groups = pkg.homework.groups
  const hw: Homework = {
    groups,
    stats: Object.fromEntries(groups.map((g) => [g.id, { complete: emptyStats(), order: emptyStats(), meaning: emptyStats() }])),
    current: null,
    hintShown: false,
    order: null,
  }
  hw.current = firstOpen(hw)
  enterCurrent(hw, rng)
  return hw
}

/** Reveal the current question's hint (counted once per attempt). Returns the hint text, or null if none. */
export function revealHint(hw: Homework): string | null {
  const q = currentQuestion(hw)
  if (!q?.hint || !hw.current) return null
  const g = hw.groups[hw.current.group]
  const st = g && hw.stats[g.id]?.[hw.current.stage]
  if (st && !hw.hintShown) st.hintsUsed++
  hw.hintShown = true
  return q.hint
}

/** Replace the tap-to-place state (from `place`/`unplace`/`move`). Ignored unless the current stage is `order`. */
export function setOrder(hw: Homework, s: OrderState) {
  const q = currentQuestion(hw)
  if (q?.type === 'order' && matchesTokens(s, q.tokens)) hw.order = s
}

export interface StageResult {
  questionId: string
  correct: boolean
  attemptNo: number
  hintUsed: boolean
  groupDone: boolean
  /** The explanation to show after answering, if the question has one. */
  explain: string | null
}

/**
 * Answer the current stage. For `order` stages `response` may be omitted: the
 * placed tokens are used. Correct → the next open stage/group is entered;
 * wrong → the same stage stays (retry). Null when homework is done.
 */
export function answerStage(hw: Homework, response: unknown, rng: Rng, responseMs = 0): StageResult | null {
  const q = currentQuestion(hw)
  const cur = hw.current
  const g = cur && hw.groups[cur.group]
  const st = g && cur && hw.stats[g.id]?.[cur.stage]
  if (!q || !g || !st) return null
  const r = response === undefined && q.type === 'order' && hw.order ? orderResponse(hw.order) : response
  const correct = gradeResponse(q, r)
  st.attempts++
  st.ms += Math.max(0, Math.round(responseMs))
  if (correct) st.solved = true
  else st.errors++
  const hintUsed = hw.hintShown
  const result: StageResult = {
    questionId: q.id,
    correct,
    attemptNo: st.attempts,
    hintUsed,
    groupDone: HOMEWORK_STAGES.every((s) => hw.stats[g.id]?.[s].solved),
    explain: q.explain ?? null,
  }
  if (correct) {
    hw.current = firstOpen(hw)
    enterCurrent(hw, rng)
  } else {
    hw.hintShown = false
    if (q.type === 'order') hw.order = newOrderState(q.tokens, rng, q.answer)
  }
  return result
}

export const isHomeworkDone = (hw: Homework) => hw.current === null

export function homeworkProgress(hw: Homework) {
  const done = hw.groups.filter((g) => HOMEWORK_STAGES.every((s) => hw.stats[g.id]?.[s].solved)).length
  return { groupsDone: done, groups: hw.groups.length }
}

/* ── snapshot / restore ───────────────────────────────────────────────── */

const Stats = z.object({
  attempts: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
  hintsUsed: z.number().int().nonnegative(),
  ms: z.number().int().nonnegative(),
  solved: z.boolean(),
})
export const HomeworkSnapshot = z.object({
  v: z.literal(1),
  groupIds: z.array(z.string()),
  stats: z.record(z.string(), z.object({ complete: Stats, order: Stats, meaning: Stats })),
  hintShown: z.boolean(),
  order: OrderStateSchema.nullable(),
})
export type HomeworkSnapshot = z.infer<typeof HomeworkSnapshot>

export const snapshotHomework = (hw: Homework): HomeworkSnapshot => ({
  v: 1,
  groupIds: hw.groups.map((g) => g.id),
  stats: structuredClone(hw.stats),
  hintShown: hw.hintShown,
  order: hw.order && structuredClone(hw.order),
})

/** Resume, or a fresh start when the snapshot is malformed or belongs to other groups. Never throws. */
export function restoreHomework(snapshot: unknown, pkg: Pick<LessonPackage, 'homework'>, rng: Rng): Homework {
  const parsed = HomeworkSnapshot.safeParse(snapshot)
  const groups = pkg.homework.groups
  const ids = groups.map((g) => g.id)
  if (!parsed.success) return startHomework(pkg, rng)
  const s = parsed.data
  if (s.groupIds.join('\u0000') !== ids.join('\u0000') || Object.keys(s.stats).length !== ids.length || !ids.every((id) => s.stats[id]))
    return startHomework(pkg, rng)
  const hw: Homework = { groups, stats: s.stats, current: null, hintShown: s.hintShown, order: null }
  hw.current = firstOpen(hw)
  const q = currentQuestion(hw)
  if (q?.type === 'order') hw.order = s.order && matchesTokens(s.order, q.tokens) ? s.order : newOrderState(q.tokens, rng, q.answer)
  return hw
}
