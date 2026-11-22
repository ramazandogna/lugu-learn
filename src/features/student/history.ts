/** The learner's own history, grouped for display. Pure: tested without the server. */
export interface HistorySession {
  id: string
  kind: 'primary' | 'replay'
  status: 'active' | 'completed' | 'abandoned'
  started_at: string
  completed_at: string | null
  active_seconds: number
  break_seconds: number
  lesson_id: string
  curriculum_lessons: { title: string; sequence: number } | null
}

export interface HistoryBreak {
  id: string
  session_id: string
  planned_minutes: number
  started_at: string
  ended_at: string | null
  early_return: boolean | null
}

export interface HistoryRow extends HistorySession {
  title: string
  /** Real breaks only (0 = "no break" choices are left out). */
  breaks: HistoryBreak[]
}

export function historyRows(sessions: readonly HistorySession[], breaks: readonly HistoryBreak[]): HistoryRow[] {
  const bySession = new Map<string, HistoryBreak[]>()
  for (const b of breaks) {
    if (b.planned_minutes <= 0) continue
    const list = bySession.get(b.session_id) ?? []
    list.push(b)
    bySession.set(b.session_id, list)
  }
  return sessions.map((s) => ({
    ...s,
    title: s.curriculum_lessons ? `Ders ${s.curriculum_lessons.sequence} · ${s.curriculum_lessons.title}` : 'Ders',
    breaks: bySession.get(s.id) ?? [],
  }))
}

/** "1 sa 5 dk", "12 dk", "1 dk'dan az". */
export function duration(seconds: number): string {
  const m = Math.round(seconds / 60)
  if (m < 1) return "1 dk'dan az"
  const h = Math.floor(m / 60)
  return h ? `${h} sa ${m % 60} dk` : `${m} dk`
}

export const STATUS_TEXT: Record<HistorySession['status'], string> = {
  active: 'Devam ediyor',
  completed: 'Tamamlandı',
  abandoned: 'Kapatıldı',
}
