/**
 * Mastery / kelime (spec bölüm 4, mv_*). Param lessonId (paket -> ders; null = hepsi).
 * Kelime satırının tarih alanları kendi süzgecinden geçer (inRangeTs).
 */
import type { AttemptRow, StatBreakdownItem, StatParams, StatResult, StatsInput, VocabRow } from './types.ts'
import { STATS_THRESHOLDS as T } from './thresholds.ts'
import { groupBy, mean, median, safeDiv } from './math.ts'
import { addDays, dayKey, diffDays, inRangeTs, rangeDays, resolveRange } from './windows.ts'
import { attemptsOf, cnt, correctRate, na, num, rateStat } from './series.ts'

function vocabOf(input: StatsInput, p: StatParams): VocabRow[] {
  return input.vocab.filter(v => p.lessonId == null || v.lessonId === p.lessonId)
}

/** Soru başına 2+ cevap: ilk ve sıralı cevaplar. */
function questionRuns(atts: readonly AttemptRow[]): { first: AttemptRow; sorted: AttemptRow[] }[] {
  const out: { first: AttemptRow; sorted: AttemptRow[] }[] = []
  for (const rows of groupBy(atts, a => a.questionId).values()) {
    if (rows.length < 2) continue
    const sorted = [...rows].sort((a, b) => a.attemptNo - b.attemptNo)
    const first = sorted[0]
    if (first !== undefined) out.push({ first, sorted })
  }
  return out
}

/* ── sayılar ───────────────────────────────────────────────────────── */

export function mvSeenCount(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  return cnt(vocabOf(input, p).filter(v => inRangeTs(v.createdAt, r)).length)
}

export function mvMasteredCount(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  return cnt(vocabOf(input, p).filter(v => v.masteredAt !== null && inRangeTs(v.masteredAt, r)).length)
}

/** Görülenlerin (createdAt pencerede) kaçı oturdu. */
export function mvMasteryRate(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const seen = vocabOf(input, p).filter(v => inRangeTs(v.createdAt, r))
  const mastered = seen.filter(v => v.masteredAt !== null).length
  return num(safeDiv(mastered, seen.length), seen.length, 'zero_denominator')
}

export function mvMasteredPerWeek(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  if (r === null) return na()
  const days = rangeDays(r)
  const count = vocabOf(input, p).filter(v => v.masteredAt !== null && inRangeTs(v.masteredAt, r)).length
  if (days < T.WEEK_MIN_DAYS) return num(null, count)
  return num(count / (days / 7), count)
}

export function mvMedianDaysToMaster(input: StatsInput, p: StatParams): StatResult {
  const r = resolveRange(p)
  const diffs: number[] = []
  for (const v of vocabOf(input, p)) {
    if (v.masteredAt !== null && inRangeTs(v.masteredAt, r)) {
      diffs.push(diffDays(dayKey(v.createdAt), dayKey(v.masteredAt)))
    }
  }
  if (diffs.length < T.MIN_AVG) return num(null, diffs.length)
  return num(median(diffs), diffs.length)
}

/** Takılan kelimeler; breakdown incorrect_count azalan. */
export function mvStuckWords(input: StatsInput, p: StatParams): StatResult {
  const list = vocabOf(input, p)
    .filter(v => v.masteredAt === null && v.incorrectCount >= T.STUCK_MISSES)
    .sort((a, b) => b.incorrectCount - a.incorrectCount || a.itemId.localeCompare(b.itemId))
  const breakdown: StatBreakdownItem[] = list.map(v => ({
    key: `${v.packageId}:${v.itemId}`,
    value: v.incorrectCount,
    n: 1,
  }))
  return cnt(list.length, { breakdown })
}

export function mvStaleWords(input: StatsInput, p: StatParams): StatResult {
  const cutoff = addDays(dayKey(p.now), -T.STALE_DAYS)
  return cnt(
    vocabOf(input, p).filter(
      v => v.masteredAt === null && v.lastAttemptAt !== null && dayKey(v.lastAttemptAt) < cutoff,
    ).length,
  )
}

/* ── kelime sınavı / tekrar ────────────────────────────────────────── */

export function mvVocabAccuracy(input: StatsInput, p: StatParams): StatResult {
  const quiz = attemptsOf(input, p.lessonId).filter(a => a.section === 'vocab_quiz')
  return rateStat(quiz, a => a.correct, T.MIN_ATTEMPTS)
}

/** Aynı soruyu tekrarlayınca (son - ilk doğru) ortalaması, puan (x100). */
export function mvRepeatGain(input: StatsInput, p: StatParams): StatResult {
  const gains = questionRuns(attemptsOf(input, p.lessonId)).map(({ first, sorted }) => {
    const last = sorted.at(-1)
    return (last?.correct ? 1 : 0) - (first.correct ? 1 : 0)
  })
  if (gains.length < T.MIN_REPEAT_QUESTIONS) return num(null, gains.length)
  const m = mean(gains)
  return num(m === null ? null : m * 100, gains.length)
}

/** İlk cevabı yanlış olan sorulardan sonra en az bir doğru yapanların oranı. */
export function mvRepeatRecovery(input: StatsInput, p: StatParams): StatResult {
  const wrongFirst = questionRuns(attemptsOf(input, p.lessonId)).filter(q => !q.first.correct)
  const recovered = wrongFirst.filter(q => q.sorted.slice(1).some(a => a.correct)).length
  if (wrongFirst.length < T.MIN_REPEAT_QUESTIONS) return num(null, wrongFirst.length)
  return num(safeDiv(recovered, wrongFirst.length), wrongFirst.length, 'zero_denominator')
}

export function mvReviewAccuracy(input: StatsInput, p: StatParams): StatResult {
  const review = attemptsOf(input, p.lessonId).filter(a => a.section === 'review')
  return rateStat(review, a => a.correct, T.MIN_ATTEMPTS)
}

/**
 * Tekrar bölümü kazancı (puan): ortak kelimeler = tekrar cevabı olan ve vocab_quiz ilk
 * denemesi olan soru. Tekrar doğruluğu - aynı kelimelerin ilk vocab_quiz doğruluğu.
 */
export function mvReviewLift(input: StatsInput, p: StatParams): StatResult {
  const atts = attemptsOf(input, p.lessonId)
  const review = atts.filter(a => a.section === 'review')
  const reviewQs = new Set(review.map(a => a.questionId))
  const firstVocab = new Map<string, boolean>()
  for (const a of atts) {
    if (a.section === 'vocab_quiz' && a.attemptNo === 1 && reviewQs.has(a.questionId) && !firstVocab.has(a.questionId)) {
      firstVocab.set(a.questionId, a.correct)
    }
  }
  const common = [...firstVocab.keys()]
  if (common.length < T.MIN_REPEAT_QUESTIONS) return num(null, common.length)
  const commonSet = new Set(common)
  const rev = review.filter(a => commonSet.has(a.questionId))
  const revRate = safeDiv(rev.filter(a => a.correct).length, rev.length)
  const vocabRate = safeDiv(common.filter(q => firstVocab.get(q) === true).length, common.length)
  return num(revRate === null || vocabRate === null ? null : (revRate - vocabRate) * 100, common.length)
}

/** Tekrar oturumu kazancı (puan): replay doğruluğu - primary doğruluğu, aynı ders kümesi. */
export function mvReplayGain(input: StatsInput, p: StatParams): StatResult {
  const kind = new Map(input.sessions.map(s => [s.id, s.kind] as const))
  const atts = attemptsOf(input, p.lessonId)
  const replay = atts.filter(a => kind.get(a.sessionId) === 'replay')
  const primary = atts.filter(a => kind.get(a.sessionId) === 'primary')
  const n = replay.length + primary.length
  if (replay.length < T.MIN_ATTEMPTS || primary.length < T.MIN_ATTEMPTS) return num(null, n)
  const ar = correctRate(replay)
  const ap = correctRate(primary)
  return num(ar === null || ap === null ? null : (ar - ap) * 100, n)
}

/** Ders başına öğrenilen kelime: oturan kelime / bitirilen ders sayısı. */
export function mvPerLesson(input: StatsInput, p: StatParams): StatResult {
  const mastered = vocabOf(input, p).filter(v => v.masteredAt !== null).length
  const doneLessons = new Set(input.completions.map(c => c.lessonId)).size
  return num(safeDiv(mastered, doneLessons), doneLessons, 'zero_denominator')
}
