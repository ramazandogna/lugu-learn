/**
 * Zaman ve pencere yardımcıları (spec 1 "Zaman", "Pencere sözlüğü").
 * Tüm yerel gün hesabı Europe/Istanbul; `now` her zaman param.
 */
import type { DayKey, IsoTs, PeriodUnit, StatParams, StatsInput } from './types.ts'

/** İki uçu dahil gün aralığı. */
export interface Range {
  from: DayKey
  to: DayKey
}

const TZ = 'Europe/Istanbul'
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 86_400_000
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' })

/** ISO zamanı Europe/Istanbul yerel günü (YYYY-MM-DD). Zaten gün ise olduğu gibi döner. */
export function dayKey(ts: IsoTs | DayKey): DayKey {
  return DAY_RE.test(ts) ? ts : dayFmt.format(new Date(ts))
}

/** Yerel saat (0-23), Europe/Istanbul. */
export function localHour(ts: IsoTs): number {
  return Number(hourFmt.format(new Date(ts)))
}

const toMs = (day: DayKey): number => Date.parse(`${day}T00:00:00Z`)

export function addDays(day: DayKey, n: number): DayKey {
  return new Date(toMs(day) + n * DAY_MS).toISOString().slice(0, 10)
}

/** to - from, gün cinsinden (tam sayı). */
export function diffDays(from: DayKey, to: DayKey): number {
  return Math.round((toMs(to) - toMs(from)) / DAY_MS)
}

/** 1=Pazartesi ... 7=Pazar (ISO). */
export function weekday(day: DayKey): number {
  const d = new Date(toMs(day)).getUTCDay()
  return d === 0 ? 7 : d
}

export function isoWeekStart(day: DayKey): DayKey {
  return addDays(day, 1 - weekday(day))
}

export function monthStart(day: DayKey): DayKey {
  return `${day.slice(0, 7)}-01`
}

/** Zaman damgalarının en geç olanı (Date.parse ile). Liste boşsa null. */
export function latestTs(list: readonly IsoTs[]): IsoTs | null {
  let best: IsoTs | null = null
  for (const t of list) {
    if (best === null || Date.parse(t) > Date.parse(best)) best = t
  }
  return best
}

export function rangeDays(r: Range): number {
  return diffDays(r.from, r.to) + 1
}

export function inRange(day: DayKey, r: Range | null): boolean {
  return r === null || (day >= r.from && day <= r.to)
}

export function inRangeTs(ts: IsoTs, r: Range | null): boolean {
  return r === null || inRange(dayKey(ts), r)
}

/**
 * params.window -> gün aralığı. "days" = [bugün-d, bugün], "range" = [from,to].
 * Pencere yoksa (veya eksik param) null: tüm veri.
 */
export function resolveRange(p: StatParams): Range | null {
  if (p.window === 'days') {
    if (p.days === undefined) return null
    const today = dayKey(p.now)
    return { from: addDays(today, -p.days), to: today }
  }
  if (p.window === 'range') {
    if (p.from === undefined || p.to === undefined) return null
    return { from: p.from, to: p.to }
  }
  return null
}

/** Son k öğe (k > uzunluk ise hepsi). */
export function lastN<T>(xs: readonly T[], k: number): T[] {
  return k >= xs.length ? [...xs] : xs.slice(Math.max(0, xs.length - k))
}

/** Aynı uzunlukta, hemen öncesindeki aralık. */
export function shiftRange(r: Range): Range {
  const len = diffDays(r.from, r.to)
  const to = addDays(r.from, -1)
  return { from: addDays(to, -len), to }
}

export interface PeriodWindows {
  cur: Range
  prev: Range
  /** Bugün kısmi olabilir (day/week/month). */
  partial: boolean
}

/** Dönem kıyası pencereleri (spec bölüm 9). Range için from/to zorunlu; yoksa null. */
export function periodWindows(unit: PeriodUnit, now: IsoTs, from?: DayKey, to?: DayKey): PeriodWindows | null {
  const today = dayKey(now)
  switch (unit) {
    case 'day': {
      const y = addDays(today, -1)
      return { cur: { from: today, to: today }, prev: { from: y, to: y }, partial: true }
    }
    case 'week': {
      const start = isoWeekStart(today)
      const pStart = addDays(start, -7)
      return {
        cur: { from: start, to: today },
        prev: { from: pStart, to: addDays(pStart, diffDays(start, today)) },
        partial: true,
      }
    }
    case 'month': {
      const start = monthStart(today)
      const prevEnd = addDays(start, -1)
      const pStart = monthStart(prevEnd)
      const cap = addDays(pStart, diffDays(start, today))
      return {
        cur: { from: start, to: today },
        prev: { from: pStart, to: cap < prevEnd ? cap : prevEnd },
        partial: true,
      }
    }
    case 'range': {
      if (from === undefined || to === undefined) return null
      const cur = { from, to }
      return { cur, prev: shiftRange(cur), partial: false }
    }
  }
}

/**
 * Tam haftaların Pazartesi başlangıçları. r varsa aralık içinde tamamen kalan haftalar;
 * yoksa ilk aktif haftadan, bugünden önceki son tam haftaya kadar.
 */
export function fullWeeks(r: Range | null, active: ReadonlySet<DayKey>, now: IsoTs): DayKey[] {
  const out: DayKey[] = []
  if (r === null) {
    const sorted = [...active].sort()
    const first = sorted[0]
    if (first === undefined) return out
    const last = addDays(isoWeekStart(dayKey(now)), -7)
    for (let w = isoWeekStart(first); w <= last; w = addDays(w, 7)) out.push(w)
    return out
  }
  let w = r.from
  const wd = weekday(w)
  if (wd !== 1) w = addDays(w, 8 - wd)
  while (addDays(w, 6) <= r.to) {
    out.push(w)
    w = addDays(w, 7)
  }
  return out
}

/** Aktif günler: attempt.at veya done.completed_at olan günler. */
export function activeDaySet(input: StatsInput): Set<DayKey> {
  const s = new Set<DayKey>()
  for (const a of input.attempts) s.add(dayKey(a.at))
  for (const c of input.completions) s.add(dayKey(c.completedAt))
  return s
}

/**
 * Zaman penceresini girdiye uygular: her tarihli satır, kendi tarih alanına göre süzülür.
 * Pencere yoksa girdi aynen döner. Mastery/speaking/task gibi kendi tarih alanını
 * kullanan statlar kendi süzgecini `inRangeTs` ile uygular.
 */
export function scopeInput(input: StatsInput, r: Range | null): StatsInput {
  if (r === null) return input
  const exams = input.exams.filter(e => inRange(e.date, r))
  const examIds = new Set(exams.map(e => e.examId))
  const results = input.results.filter(x => examIds.has(x.examId))
  const resultKeys = new Set(results.map(x => `${x.examId}:${x.subjectId}`))
  const sessions = input.sessions.filter(s => inRangeTs(s.startedAt, r))
  const sessionIds = new Set(sessions.map(s => s.id))
  return {
    ...input,
    exams,
    results,
    topics: input.topics.filter(t => resultKeys.has(t.resultKey)),
    sessions,
    sections: input.sections.filter(x => sessionIds.has(x.sessionId)),
    events: input.events.filter(x => sessionIds.has(x.sessionId)),
    breaks: input.breaks.filter(x => sessionIds.has(x.sessionId)),
    attempts: input.attempts.filter(x => inRangeTs(x.at, r)),
    completions: input.completions.filter(x => inRangeTs(x.completedAt, r)),
    assessments: input.assessments.filter(x => inRangeTs(x.submittedAt, r)),
    rewards: input.rewards.filter(x => inRangeTs(x.createdAt, r)),
  }
}
