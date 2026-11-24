/**
 * Ödev ve sorumluluk (spec bölüm 7, hw_*). İki kaynak: ders içi ödev bölümü (section=homework)
 * ve admin görevleri (TaskRow, 0011). İptal edilen görevler her sayımda dışlanır.
 * Gecikmiş = open|in_progress ve due_date < bugün. Zamanında = done ve date(completed) <= due.
 */
import type { StatBreakdownItem, StatParams, StatResult, StatsInput, TaskRow } from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { mean, safeDiv } from './math.ts'
import { addDays, dayKey, diffDays, inRange, inRangeTs, resolveRange } from './windows.ts'
import { attemptsOf, cnt, nodata, num, rateStat, sessionIdsOf, withList } from './series.ts'

/** İptal dışı görevler; bySubject ise p.subjectId'ye göre süzülür (null/undefined = hepsi). */
function activeTasks(input: StatsInput, p: StatParams, bySubject: boolean): TaskRow[] {
  return input.tasks.filter(
    t => t.status !== 'cancelled' && (!bySubject || p.subjectId == null || t.subjectId === p.subjectId),
  )
}

const isOpen = (t: TaskRow): boolean => t.status === 'open' || t.status === 'in_progress'

/** Son tarih (yoksa oluşturulma) gününe göre. */
const effectiveDay = (t: TaskRow): string => t.dueDate ?? dayKey(t.createdAt)

/** Zamanında mı: done, due var ve tamamlanma günü <= due. Due/completed yoksa null. */
function onTime(t: TaskRow): boolean | null {
  if (t.dueDate === null || t.completedAt === null) return null
  return dayKey(t.completedAt) <= t.dueDate
}

/* ── ders içi ödev bölümü ──────────────────────────────────────────── */

export function hwSectionCompletion(input: StatsInput, p: StatParams): StatResult {
  const ids = sessionIdsOf(input, p.lessonId)
  const hw = input.sections.filter(x => x.section === 'homework' && ids.has(x.sessionId))
  const started = hw.filter(x => x.status !== 'not_started')
  const done = hw.filter(x => x.status === 'completed').length
  if (started.length < T.MIN_SESSIONS) return num(null, started.length)
  return num(safeDiv(done, started.length), started.length, 'zero_denominator')
}

export function hwSectionAccuracy(input: StatsInput, p: StatParams): StatResult {
  const hw = attemptsOf(input, p.lessonId).filter(a => a.section === 'homework')
  return rateStat(hw, a => a.correct, T.MIN_ATTEMPTS)
}

/* ── görevler (0011) ───────────────────────────────────────────────── */

export function hwTaskTotal(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  return cnt(activeTasks(input, p, true).filter(t => inRangeTs(t.createdAt, r)).length)
}

export function hwTaskDone(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  return cnt(
    activeTasks(input, p, true).filter(t => t.status === 'done' && t.completedAt !== null && inRangeTs(t.completedAt, r))
      .length,
  )
}

/** Son tarihi pencere içinde olan görevlerin tamamlanma oranı. */
export function hwTaskCompletionRate(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const rows = activeTasks(input, p, true).filter(t => inRange(effectiveDay(t), r))
  const done = rows.filter(t => t.status === 'done').length
  return num(safeDiv(done, rows.length), rows.length, 'zero_denominator')
}

export function hwTaskOnTimeRate(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const rows = activeTasks(input, p, true).filter(
    t => t.status === 'done' && t.dueDate !== null && inRange(t.dueDate, r),
  )
  const ok = rows.filter(t => onTime(t) === true).length
  if (rows.length < T.MIN_TASKS_TIMING) return num(null, rows.length)
  return num(safeDiv(ok, rows.length), rows.length, 'zero_denominator')
}

export function hwTaskOverdueCount(input: StatsInput, p: StatParams): StatResult {
  const today = dayKey(p.now)
  return cnt(
    activeTasks(input, p, true).filter(t => isOpen(t) && t.dueDate !== null && t.dueDate < today).length,
  )
}

/** Geç teslimde ortalama gecikme (gün, >= 0). */
export function hwTaskAvgDelayDays(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const delays: number[] = []
  for (const t of activeTasks(input, p, false)) {
    if (t.status !== 'done' || t.dueDate === null || t.completedAt === null) continue
    if (!inRangeTs(t.completedAt, r)) continue
    delays.push(Math.max(0, diffDays(t.dueDate, dayKey(t.completedAt))))
  }
  if (delays.length < T.MIN_TASKS_TIMING) return num(null, delays.length)
  return num(mean(delays), delays.length)
}

/** Atamadan tamamlanmaya gün (ortalama). */
export function hwTaskLeadDays(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const leads: number[] = []
  for (const t of activeTasks(input, p, true)) {
    if (t.status !== 'done' || t.completedAt === null || !inRangeTs(t.completedAt, r)) continue
    leads.push(diffDays(dayKey(t.createdAt), dayKey(t.completedAt)))
  }
  if (leads.length < T.MIN_TASKS_TIMING) return num(null, leads.length)
  return num(mean(leads), leads.length)
}

export function hwTaskOpenCount(input: StatsInput, p: StatParams): StatResult {
  return cnt(activeTasks(input, p, true).filter(isOpen).length)
}

export function hwTaskDueSoon(input: StatsInput, p: StatParams): StatResult {
  const today = dayKey(p.now)
  const end = addDays(today, T.DUE_SOON_DAYS)
  return cnt(
    activeTasks(input, p, false).filter(t => isOpen(t) && t.dueDate !== null && t.dueDate >= today && t.dueDate <= end)
      .length,
  )
}

/** Ders bazında tamamlama oranı; ders başına payda < 2 -> null. value = genel oran. */
export function hwTaskBySubject(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const rows = activeTasks(input, p, false).filter(t => inRange(effectiveDay(t), r))
  const items: StatBreakdownItem[] = input.subjects
    .map(s => {
      const own = rows.filter(t => t.subjectId === s.id)
      const done = own.filter(t => t.status === 'done').length
      return {
        key: s.id,
        value: own.length < T.MIN_TASKS_SUBJECT ? null : safeDiv(done, own.length),
        n: own.length,
      }
    })
    .sort((a, b) => a.key.localeCompare(b.key))
  const done = rows.filter(t => t.status === 'done').length
  return withList(items, safeDiv(done, rows.length), rows.length, 'zero_denominator')
}

/** Zamanında teslim serisi: due'su bugüne kadar olan görevlerde sondan geriye. */
export function hwTaskStreak(input: StatsInput, p: StatParams): StatResult {
  const today = dayKey(p.now)
  const due = activeTasks(input, p, false)
    .filter(t => t.dueDate !== null && t.dueDate <= today)
    .sort((a, b) => (b.dueDate ?? '').localeCompare(a.dueDate ?? '') || a.id.localeCompare(b.id))
  if (due.length === 0) return nodata()
  let c = 0
  for (const t of due) {
    if (onTime(t) !== true) break
    c++
  }
  return cnt(c)
}
