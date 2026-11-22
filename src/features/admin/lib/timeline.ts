import { PROGRAM_EVENT_LABEL, SESSION_EVENT_LABEL, SESSION_STATUS, formatDateTime, formatDuration, sectionLabel } from './format'

/** The row shapes the timeline reads (subsets of the server rows). */
export interface TimelineInput {
  sessions: readonly {
    id: string
    lesson_id: string
    kind: 'primary' | 'replay'
    status: 'active' | 'completed' | 'abandoned'
    started_at: string
    completed_at: string | null
    last_seen_at: string
    active_seconds: number
  }[]
  completions: readonly { id: string; lesson_id: string; completed_at: string }[]
  assessments: readonly { id: string; session_id: string; percent: number; submitted_at: string }[]
  breaks: readonly { id: string; after_section: string; planned_minutes: number; started_at: string; ended_at: string | null; early_return: boolean | null }[]
  events: readonly { id: string; kind: string; at: string }[]
  programEvents: readonly { id: string; kind: string; created_at: string; to_lesson_id: string | null; note: string | null }[]
  lessonTitle: (id: string | null) => string
}

export type TimelineCategory = 'session' | 'completion' | 'assessment' | 'break' | 'event' | 'program'

export interface TimelineItem {
  key: string
  at: string
  time: string
  title: string
  description?: string
  category: TimelineCategory
  fill: string
}

const FILL: Record<TimelineCategory, string> = {
  session: 'bg-primary',
  completion: 'bg-positive',
  assessment: 'bg-accent',
  break: 'bg-muted',
  event: 'bg-hair',
  program: 'bg-warning',
}

/** Session events that are noise on a timeline (they come in pairs with a more telling one). */
const QUIET_EVENTS = new Set(['visibility_visible', 'idle_end'])

/** One readable, newest-first list from sessions, breaks, results and program changes. */
export function buildTimeline(input: TimelineInput, opts: { includeMinorEvents?: boolean; limit?: number } = {}): TimelineItem[] {
  const out: Omit<TimelineItem, 'time' | 'fill'>[] = []
  const sessionLesson = new Map(input.sessions.map((s) => [s.id, s.lesson_id]))

  for (const s of input.sessions) {
    const lesson = input.lessonTitle(s.lesson_id)
    out.push({
      key: `s-${s.id}`,
      at: s.started_at,
      category: 'session',
      title: `${s.kind === 'replay' ? 'Tekrar oturumu' : 'Ders oturumu'} başladı: ${lesson}`,
      description: `${SESSION_STATUS[s.status]} · etkin süre ${formatDuration(s.active_seconds)}`,
    })
    if (s.status === 'abandoned')
      out.push({ key: `sa-${s.id}`, at: s.last_seen_at, category: 'session', title: `Oturum yarım bırakıldı: ${lesson}` })
  }
  for (const c of input.completions)
    out.push({ key: `c-${c.id}`, at: c.completed_at, category: 'completion', title: `Ders tamamlandı: ${input.lessonTitle(c.lesson_id)}` })
  for (const a of input.assessments)
    out.push({
      key: `a-${a.id}`,
      at: a.submitted_at,
      category: 'assessment',
      title: `Değerlendirme gönderildi: ${input.lessonTitle(sessionLesson.get(a.session_id) ?? null)}`,
      description: `Puan %${Math.round(a.percent)}`,
    })
  for (const b of input.breaks) {
    const planned = b.planned_minutes ? `${b.planned_minutes} dk planlandı` : 'süresiz'
    const ended = b.ended_at ? `, ${formatDuration((Date.parse(b.ended_at) - Date.parse(b.started_at)) / 1000)} sürdü` : ', sürüyor'
    out.push({
      key: `b-${b.id}`,
      at: b.started_at,
      category: 'break',
      title: `${sectionLabel(b.after_section)} sonrası mola`,
      description: `${planned}${ended}${b.early_return ? ' · erken döndü' : ''}`,
    })
  }
  for (const e of input.events) {
    if (!opts.includeMinorEvents && QUIET_EVENTS.has(e.kind)) continue
    out.push({ key: `e-${e.id}`, at: e.at, category: 'event', title: SESSION_EVENT_LABEL[e.kind as keyof typeof SESSION_EVENT_LABEL] ?? e.kind })
  }
  for (const p of input.programEvents)
    out.push({
      key: `p-${p.id}`,
      at: p.created_at,
      category: 'program',
      title: PROGRAM_EVENT_LABEL[p.kind] ?? p.kind,
      description: [p.to_lesson_id ? input.lessonTitle(p.to_lesson_id) : null, p.note].filter(Boolean).join(' · ') || undefined,
    })

  return out
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || a.key.localeCompare(b.key))
    .slice(0, opts.limit ?? 300)
    .map((x) => ({ ...x, time: formatDateTime(x.at), fill: FILL[x.category] }))
}
