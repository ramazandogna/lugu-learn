/**
 * Dönem kıyasları (spec bölüm 9, pc_*). Taban stat bu dosyaya fonksiyon olarak parametre
 * gelir (run); döngüsel import yok. Her pc_* taban'ı iki pencerede çalıştırır:
 * value = cur - prev, breakdown = cur / prev / pct_change.
 */
import type { StatId } from './registry.ts'
import type { StatParams, StatResult, StatsInput } from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { mean, pctChange, sumOf, z } from './math.ts'
import { inRangeTs, periodWindows, resolveRange, shiftRange, type Range } from './windows.ts'
import { na, num } from './series.ts'

/** Registry'nin runStat'ı: taban stat'ı id ile, pencere uygulanmış girdide çalıştırır. */
export type StatRunner = (id: StatId, input: StatsInput, params: StatParams) => StatResult

type BaseRun = (params: StatParams) => StatResult

function windowed(p: StatParams, r: Range): StatParams {
  return { ...p, window: 'range', from: r.from, to: r.to }
}

/** cur - prev; breakdown cur/prev/pct_change (+ partial bayrağı). Taban null ise insufficient. */
function periodDiff(p: StatParams, base: BaseRun, scale = 1): StatResult {
  const w = periodWindows(p.periodUnit ?? 'day', p.now, p.from, p.to)
  if (w === null) return na()
  const cur = base(windowed(p, w.cur))
  const prev = base(windowed(p, w.prev))
  const n = cur.n + prev.n
  if (cur.value === null || prev.value === null) return num(null, n, 'insufficient')
  const c = cur.value * scale
  const pr = prev.value * scale
  return {
    value: c - pr,
    n,
    breakdown: [
      { key: 'cur', value: c, n: cur.n },
      { key: 'prev', value: pr, n: prev.n },
      { key: 'pct_change', value: pctChange(prev.value, cur.value), n: 0 },
      { key: 'partial', value: w.partial ? 1 : 0, n: 0 },
    ],
  }
}

/** Bu dönem değeri x, önceki 4 aynı uzunlukta dönem r; z(x, r). */
function periodZ(p: StatParams, base: BaseRun): StatResult {
  const w = periodWindows(p.periodUnit ?? 'day', p.now, p.from, p.to)
  if (w === null) return na()
  const x = base(windowed(p, w.cur)).value
  const refs: number[] = []
  let r: Range = w.cur
  for (let i = 0; i < T.PERIOD_REF_COUNT; i++) {
    r = shiftRange(r)
    const v = base(windowed(p, r)).value
    if (v !== null) refs.push(v)
  }
  if (x === null || refs.length < T.MIN_REF_Z) return num(null, refs.length)
  return num(z(x, refs, T.SD_FLOOR_PCT), refs.length)
}

/* ── tabanı registry'den alan sarmalayıcılar ─────────────────────── */

export function pcActiveMinutes(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('tm_active_minutes', input, q))
}

export function pcActiveDays(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('st_active_days', input, q))
}

export function pcLessons(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('ls_completed_count', input, q))
}

export function pcAccuracy(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('ls_accuracy', input, q), 100)
}

export function pcFirstTryAccuracy(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('ls_first_try_accuracy', input, q), 100)
}

export function pcExamAvg(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('ex_avg_all', input, q))
}

export function pcMastered(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('mv_mastered_count', input, q))
}

export function pcFocusLossRate(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('tm_focus_loss_per_hour', input, q))
}

export function pcTaskCompletion(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('hw_task_completion_rate', input, q), 100)
}

export function pcSpeaking(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  return periodDiff(p, q => run('sp_count', input, q))
}

/** Dönem kıyası, taban = registry'den herhangi bir stat (statId zorunlu). */
export function pcGeneric(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  const id = p.statId
  if (id === undefined) return na()
  return periodDiff(p, q => run(id, input, q))
}

/** Dönem z-skoru, taban = statId. */
export function pcZVsPrev4(input: StatsInput, p: StatParams, run: StatRunner): StatResult {
  const id = p.statId
  if (id === undefined) return na()
  return periodZ(p, q => run(id, input, q))
}

/* ── registry'den bağımsız tabanlar (kendi süzgecini uygular) ─────── */

/** Dönemdeki ödüllerin toplamı (XP). */
export function pcXp(input: StatsInput, p: StatParams): StatResult {
  return periodDiff(p, q => {
    const r = resolveRange(q)
    const rows = input.rewards.filter(x => inRangeTs(x.createdAt, r))
    return num(sumOf(rows, x => x.amount), rows.length, 'insufficient')
  })
}

/** Dönemdeki değerlendirme yüzdelerinin ortalaması. */
export function pcAssessmentAvg(input: StatsInput, p: StatParams): StatResult {
  return periodDiff(p, q => {
    const r = resolveRange(q)
    const vals = input.assessments.filter(x => inRangeTs(x.submittedAt, r)).map(x => x.percent)
    if (vals.length < T.MIN_AVG) return num(null, vals.length)
    return num(mean(vals), vals.length)
  })
}
