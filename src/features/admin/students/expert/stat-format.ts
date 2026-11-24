import { runStat, type Direction, type StatGroup, type StatId, type StatMeta, type StatParams, type StatResult, type StatsInput, type StatUnit } from '@/domain/stats'
import { addDays, dayKey, resolveRange, shiftRange, type Range } from '@/domain/stats/windows'

export const GROUP_LABEL: Record<StatGroup, string> = {
  exam: 'Denemeler',
  lesson: 'Ders ilerlemesi',
  mastery: 'Kelime ve tekrar',
  time: 'Zaman ve odak',
  habit: 'Alışkanlık',
  task: 'Ödev ve görev',
  speaking: 'Konuşma',
  period: 'Dönem farkları',
}
export const GROUP_ORDER: StatGroup[] = ['exam', 'lesson', 'mastery', 'time', 'habit', 'task', 'speaking', 'period']

export type WindowKey = 'all' | 'day' | 'week' | 'month' | 'range' | 'last5' | 'last10' | 'lastN'

export const WINDOW_OPTIONS: { value: WindowKey; label: string }[] = [
  { value: 'all', label: 'Tüm veri' },
  { value: 'day', label: 'Gün (son 1)' },
  { value: 'week', label: 'Hafta (son 7)' },
  { value: 'month', label: 'Ay (son 30)' },
  { value: 'range', label: 'Özel aralık' },
  { value: 'last5', label: 'Son 5 deneme' },
  { value: 'last10', label: 'Son 10 deneme' },
  { value: 'lastN', label: 'Son N deneme' },
]

export interface Controls {
  window: WindowKey
  from: string
  to: string
  n: number
  nth: number | null
  metric: 'pct' | 'net'
  subjectId: string
  lessonId: string
}

export function buildParams(c: Controls, now: string, nthDefault: number): StatParams {
  const p: StatParams = {
    now,
    metric: c.metric,
    nth: c.nth ?? nthDefault,
    n: c.window === 'last5' ? 5 : c.window === 'last10' ? 10 : c.n,
    subjectId: c.subjectId || null,
    lessonId: c.lessonId || null,
  }
  if (c.window === 'day') return { ...p, window: 'days', days: 0 }
  if (c.window === 'week') return { ...p, window: 'days', days: 6 }
  if (c.window === 'month') return { ...p, window: 'days', days: 29 }
  if (c.window === 'range' && c.from && c.to) return { ...p, window: 'range', from: c.from, to: c.to }
  if (c.window === 'last5' || c.window === 'last10' || c.window === 'lastN') return { ...p, window: 'lastN' }
  return p
}

/** Params of the period just before the selected day/range window; null when the window has no calendar length. */
export function prevParams(p: StatParams): StatParams | null {
  const r = resolveRange(p)
  if (!r) return null
  const prev = shiftRange(r)
  return { ...p, window: 'range', from: prev.from, to: prev.to }
}

export function rangeParams(p: StatParams, r: Range): StatParams {
  return { ...p, window: 'range', from: r.from, to: r.to }
}

export function safeRun(id: string, input: StatsInput, p: StatParams): StatResult {
  try {
    return runStat(id as StatId, input, p)
  } catch {
    return { value: null, n: 0, reason: 'not_applicable' }
  }
}

const nf = (digits: number) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: digits })
const n0 = nf(0)
const n1 = nf(1)
const n2 = nf(2)

/** Formats a stat value by its unit. Domain values stay raw; rounding happens here only. */
export function formatStat(v: number | null, unit: StatUnit, metric: 'pct' | 'net' = 'pct'): string {
  if (v === null) return '—'
  switch (unit) {
    case 'percent': return `%${n1.format(v)}`
    case 'ratio': return `%${n0.format(v * 100)}`
    case 'metric': return metric === 'pct' ? `%${n1.format(v)}` : n2.format(v)
    case 'net': return n2.format(v)
    case 'count': return n0.format(v)
    case 'seconds': return `${n0.format(v)} sn`
    case 'minutes': return `${n1.format(v)} dk`
    case 'ms': return `${n0.format(v)} ms`
    case 'days': return `${n1.format(v)} gün`
    case 'points': return `${n1.format(v)} puan`
    case 'flag': return v >= 1 ? 'Var' : 'Yok'
    case 'rank': return `${n0.format(v)}. sıra`
    case 'per_week': return `${n1.format(v)} /hafta`
    case 'per_hour': return `${n1.format(v)} /saat`
    case 'slope': return n2.format(v)
    case 'z': return n2.format(v)
  }
}

export function formatDelta(d: number, unit: StatUnit, metric: 'pct' | 'net'): string {
  const sign = d > 0 ? '+' : d < 0 ? '−' : ''
  return `${sign}${formatStat(Math.abs(d), unit, metric)}`
}

export type Verdict = 'good' | 'bad' | 'flat'

export function verdict(delta: number, dir: Direction): Verdict {
  if (delta === 0 || dir === 'neutral') return 'flat'
  const up = delta > 0
  return (dir === 'higher_better') === up ? 'good' : 'bad'
}

export const REASON_TEXT: Record<NonNullable<StatResult['reason']>, string> = {
  insufficient: 'Henüz yeterli veri yok',
  no_data: 'Bu dönemde kayıt yok',
  zero_denominator: 'Hesaplanamıyor: bölen sıfır',
  not_applicable: 'Bu seçimle hesaplanamıyor',
}

export const NEED_TEXT: Record<string, string> = {
  subjectId: 'Bir okul dersi seç',
  lessonId: 'Bir müfredat dersi seç',
}

/** The calm sentence for a stat without a value. */
export function emptyText(meta: StatMeta, r: StatResult, p: StatParams): string {
  for (const need of meta.needs) {
    if (p[need] == null && NEED_TEXT[need]) return NEED_TEXT[need]
  }
  if (r.reason === 'insufficient' && meta.minN > 0) return `En az ${meta.minN} kayıt gerekir (şu an ${r.n})`
  return r.reason ? REASON_TEXT[r.reason] : 'Veri yok'
}

export function periodUnitOf(c: Controls): 'day' | 'week' | 'month' | 'range' {
  if (c.window === 'day') return 'day'
  if (c.window === 'month') return 'month'
  if (c.window === 'range' && c.from && c.to) return 'range'
  return 'week'
}

export const today = (now: string) => dayKey(now)
export { addDays }

import { listStats } from '@/domain/stats'
const ALL_META = new Map(listStats().map((m) => [m.id, m] as const))
export const metaOf = (id: string): StatMeta | undefined => ALL_META.get(id)
