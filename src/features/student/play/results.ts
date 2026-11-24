/** Glue between the answers of this run and the attempt history (`src/play/attempts.ts`). */
import { buildRun, buildRuns, bestStreakEver, compareRuns, mostMissed, recentRuns, type AttemptRow, type Run, type RunComparison } from '@/play/attempts'
import * as api from '@/lib/api/student'
import type { SectionKey } from '@/domain/content'

export interface ResultsData {
  current: Run
  previous: Run | undefined
  comparison: RunComparison
  /** Oldest first, current last; at most 5. */
  recent: Run[]
  confused: { questionId: string; misses: number }[]
  bestEver: number
}

export interface LocalRow {
  sessionId: string
  packageId: string
  section: string
  questionId: string
  correct: boolean
  responseMs: number | null
  hintUsed: boolean
}

/** Local rows of this run -> `AttemptRow`s with the right `attempt_no` (nth try of that question). */
export function toRows(rows: readonly LocalRow[]): AttemptRow[] {
  const n = new Map<string, number>()
  return rows.map((r, i) => {
    const no = (n.get(r.questionId) ?? 0) + 1
    n.set(r.questionId, no)
    return {
      session_id: r.sessionId,
      package_id: r.packageId,
      section: r.section,
      question_id: r.questionId,
      attempt_no: no,
      correct: r.correct,
      response_ms: r.responseMs,
      hint_used: r.hintUsed,
      created_at: new Date(Date.now() + i).toISOString(),
    }
  })
}

/** Earlier runs of the same package and section (this session left out). Empty when the read fails. */
export async function loadHistory(packageId: string, section: Exclude<SectionKey, 'vocabulary'>, sessionId: string): Promise<Run[]> {
  try {
    const rows = await api.getQuestionAttempts(packageId, section)
    return buildRuns(rows, { section, packageId }).filter((r) => r.sessionId !== sessionId)
  } catch {
    return []
  }
}

export function composeResults(local: readonly LocalRow[], earlier: readonly Run[]): ResultsData | null {
  const current = buildRun(toRows(local))
  if (!current) return null
  const previous = earlier[0]
  const comparison = compareRuns(current, previous, earlier.slice(1))
  const all = [current, ...earlier]
  return {
    current,
    previous,
    comparison,
    recent: recentRuns(all).reverse(),
    confused: mostMissed(all, 3),
    bestEver: Math.max(bestStreakEver(all), current.bestStreak),
  }
}
