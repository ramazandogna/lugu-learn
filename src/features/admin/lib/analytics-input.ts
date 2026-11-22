import { sectionTimes, type AttemptRow, type SectionRow, type SessionRow, type VocabRow } from '@/domain/analytics'
import { SECTION_KEYS } from '@/domain/content'

/** Server rows (snake_case) → the shapes `domain/analytics` reads. */
export function toAnalyticsInput(d: {
  sections: readonly { section: string; started_at: string | null; completed_at: string | null; active_seconds: number }[]
  attempts: readonly { question_id: string; section: string; attempt_no: number; correct: boolean; response_ms: number | null; hint_used: boolean; created_at: string }[]
  mastery: readonly { item_id: string; correct_count: number; incorrect_count: number; mastered_at: string | null }[]
  sessions: readonly { status: 'active' | 'completed' | 'abandoned'; started_at: string; kind: 'primary' | 'replay' }[]
  /** Idle seconds are tracked per session, not per section (`learning_sessions.idle_seconds`). */
}): { sections: SectionRow[]; attempts: AttemptRow[]; vocab: VocabRow[]; sessions: SessionRow[] } {
  return {
    sections: d.sections.map((s) => ({ section: s.section, startedAt: s.started_at, completedAt: s.completed_at, activeSeconds: s.active_seconds, idleSeconds: 0 })),
    attempts: d.attempts.map((a) => ({
      questionId: a.question_id,
      section: a.section,
      attemptNo: a.attempt_no,
      correct: a.correct,
      responseMs: a.response_ms,
      hintUsed: a.hint_used,
      at: a.created_at,
    })),
    vocab: d.mastery.map((m) => ({ itemId: m.item_id, correctCount: m.correct_count, incorrectCount: m.incorrect_count, masteredAt: m.mastered_at })),
    sessions: d.sessions.filter((s) => s.kind === 'primary').map((s) => ({ status: s.status, startedAt: s.started_at })),
  }
}

export interface SectionSummary {
  section: string
  samples: number
  avgActiveSeconds: number
  /** Median wall-clock duration of completed sections; null when none completed. */
  medianDurationSeconds: number | null
}

/** Per section, in lesson order: how many records, mean active time, median wall-clock time. */
export function summariseSections(rows: readonly SectionRow[]): SectionSummary[] {
  const times = sectionTimes(rows)
  return SECTION_KEYS.flatMap((key) => {
    const mine = times.filter((t) => t.section === key && (t.activeSeconds > 0 || t.durationSeconds !== null))
    if (!mine.length) return []
    const durations = mine.flatMap((t) => (t.durationSeconds === null ? [] : [t.durationSeconds])).sort((a, b) => a - b)
    const mid = Math.floor(durations.length / 2)
    const median = durations.length ? (durations.length % 2 ? durations[mid]! : (durations[mid - 1]! + durations[mid]!) / 2) : null
    return [
      {
        section: key,
        samples: mine.length,
        avgActiveSeconds: Math.round(mine.reduce((s, t) => s + t.activeSeconds, 0) / mine.length),
        medianDurationSeconds: median,
      },
    ]
  })
}
