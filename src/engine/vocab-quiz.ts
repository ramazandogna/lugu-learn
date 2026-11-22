/**
 * The vocabulary mastery quiz: the ported mastery engine (`mastery.ts`, used
 * unchanged) driven by a lesson package's vocabulary.
 *
 * Rules (from the engine, not re-implemented here):
 * - Pool keys are vocabulary ids. An item is mastered after TWO CORRECT
 *   ANSWERS SINCE ITS LAST MISS: a miss resets its count to 0. Mastered items
 *   leave the queue; the quiz ends when the queue is empty (all mastered).
 * - A missed question is shown again unchanged (same direction and options);
 *   from its second miss it is shown with two options.
 *
 * Added here:
 * - Direction alternates per freshly built showing of an item: the first is
 *   EN→TR (recognition), the next TR→EN, and so on. A retried question keeps
 *   its direction (engine behaviour). The direction is stored in `question.kind`.
 * - Up to 3 distractors from other items, same difficulty first, then the
 *   nearest difficulty; no two options equal after `normalizeAnswer`.
 * - Overall accuracy (correct / tries) as a supplementary metric only.
 * - A versioned JSON snapshot so a session resumes mid-quiz.
 */
import { z } from 'zod'

import type { LessonPackage, VocabItem } from '@/domain/content'
import { normalizeAnswer, vocabPrompt, vocabTarget, type VocabDirection } from '@/domain/grading'

import { answer, emptyState, next, progress, reset, shuffleWith, type Outcome, type Question, type Rng, type RunState } from './mastery'

export interface VocabQuiz {
  state: RunState<string>
  /** All package items by id (pre-mastered ones included). */
  items: Map<string, VocabItem>
  /** Ids in this run's pool (package order). */
  pool: string[]
  /** Items already mastered on the server before this run (not quizzed). */
  preMastered: string[]
  /** Fresh showings built per item; drives the direction alternation. */
  built: Map<string, number>
}

/** What the client sends to `record_vocab_answer(item_id, direction, chosen_text)`. */
export interface VocabAnswer {
  outcome: Outcome
  vocabId: string
  direction: VocabDirection
  chosenText: string
}

const DISTRACTORS = 3

const directionOf = (q: Question | null): VocabDirection | null =>
  q?.kind === 'en_tr' || q?.kind === 'tr_en' ? q.kind : null

/**
 * Up to three distractor texts for `item` in `direction`, from the other items:
 * same difficulty first (shuffled), then by increasing difficulty distance
 * (shuffled within a distance). Skips any text equal, after normalisation, to
 * the answer or to an already chosen distractor. Deterministic given `rng`.
 */
export function pickDistractors(item: VocabItem, all: readonly VocabItem[], direction: VocabDirection, rng: Rng): string[] {
  const others = all.filter((o) => o.id !== item.id)
  const byDistance = new Map<number, VocabItem[]>()
  for (const o of others) {
    const d = Math.abs(o.difficulty - item.difficulty)
    byDistance.set(d, [...(byDistance.get(d) ?? []), o])
  }
  const ordered = [...byDistance.keys()].sort((a, b) => a - b).flatMap((d) => shuffleWith(byDistance.get(d) ?? [], rng))
  const seen = new Set([normalizeAnswer(vocabTarget(item, direction))])
  const out: string[] = []
  for (const o of ordered) {
    if (out.length === DISTRACTORS) break
    const text = vocabTarget(o, direction)
    const key = normalizeAnswer(text)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
  }
  return out
}

/** Build one mastery-engine question for `item` (answer is option 0; the engine shuffles display order). */
export function buildVocabQuestion(item: VocabItem, all: readonly VocabItem[], direction: VocabDirection, rng: Rng): Question {
  return {
    kind: direction,
    prompt: vocabPrompt(item, direction),
    size: 'text',
    options: [vocabTarget(item, direction), ...pickDistractors(item, all, direction, rng)],
    answer: 0,
  }
}

function builder(quiz: VocabQuiz, rng: Rng) {
  const all = [...quiz.items.values()]
  return (id: string): Question => {
    const item = quiz.items.get(id)
    if (!item) throw new Error(`vocab-quiz: unknown item ${id}`) // pool is built from items: unreachable
    const n = quiz.built.get(id) ?? 0
    quiz.built.set(id, n + 1)
    return buildVocabQuestion(item, all, n % 2 === 0 ? 'en_tr' : 'tr_en', rng)
  }
}

/**
 * Start a fresh quiz over `pkg.vocabulary` and show the first question.
 * `preMastered`: ids the server already reports mastered; they are left out of the pool.
 */
export function startVocabQuiz(pkg: Pick<LessonPackage, 'vocabulary'>, rng: Rng, preMastered: readonly string[] = []): VocabQuiz {
  const items = new Map(pkg.vocabulary.map((v) => [v.id, v]))
  const pre = new Set(preMastered.filter((id) => items.has(id)))
  const quiz: VocabQuiz = {
    state: emptyState<string>(),
    items,
    pool: pkg.vocabulary.map((v) => v.id).filter((id) => !pre.has(id)),
    preMastered: [...pre],
    built: new Map(),
  }
  reset(quiz.state, quiz.pool, rng)
  next(quiz.state, builder(quiz, rng), rng)
  return quiz
}

/** Show the next question. False when every item is mastered (quiz over). */
export const nextVocabQuestion = (quiz: VocabQuiz, rng: Rng) => next(quiz.state, builder(quiz, rng), rng)

/**
 * Answer option `optionIndex` (an index into `state.question.options`, i.e.
 * the original option, not the display position). Null when not answerable.
 * The returned ids/text are what the server call needs.
 */
export function answerVocab(quiz: VocabQuiz, optionIndex: number, rng: Rng): VocabAnswer | null {
  const { current, question } = quiz.state
  const direction = directionOf(question)
  const chosenText = question?.options[optionIndex]
  if (current === null || !direction || chosenText === undefined) return null
  const outcome = answer(quiz.state, optionIndex, rng)
  return outcome && { outcome, vocabId: current, direction, chosenText }
}

/** The direction of the question on screen, or null. */
export const currentDirection = (quiz: VocabQuiz) => directionOf(quiz.state.question)

/** True when no item is left to master. */
export const isVocabQuizDone = (quiz: VocabQuiz) => quiz.state.current === null && quiz.state.queue.length === 0

/**
 * Progress for the UI. `mastered`/`total` count the whole package (pre-mastered
 * included). `percent` is the engine's mastery progress over this run's pool;
 * `accuracyPercent` (correct / tries) is supplementary and never replaces mastery.
 */
export function vocabQuizProgress(quiz: VocabQuiz) {
  const p = progress(quiz.state, quiz.pool.length)
  const { tries, wrong } = quiz.state
  return {
    mastered: p.done + quiz.preMastered.length,
    total: quiz.items.size,
    percent: quiz.pool.length ? p.percent : 100,
    tries,
    correct: tries - wrong,
    accuracyPercent: tries ? Math.round(((tries - wrong) / tries) * 100) : null,
  }
}

/* ── snapshot / restore ───────────────────────────────────────────────── */

const QuestionSchema = z.object({
  kind: z.enum(['en_tr', 'tr_en']),
  prompt: z.string(),
  size: z.enum(['big', 'jp', 'text']).optional(),
  options: z.array(z.string()).min(1),
  answer: z.number().int().nonnegative(),
  explain: z.string().optional(),
  stat: z.object({ label: z.string(), path: z.array(z.string()).optional() }).optional(),
})
const MissSchema = z.object({ label: z.string(), n: z.number().int().nonnegative(), path: z.array(z.string()).optional(), group: z.string().optional() })
const Count = z.number().int().nonnegative()

export const VocabQuizSnapshot = z.object({
  v: z.literal(1),
  pool: z.array(z.string()),
  preMastered: z.array(z.string()),
  built: z.array(z.tuple([z.string(), Count])),
  queue: z.array(z.string()),
  counts: z.array(z.tuple([z.string(), Count])),
  current: z.string().nullable(),
  question: QuestionSchema.nullable(),
  order: z.array(Count),
  picked: Count.nullable(),
  tries: Count,
  wrong: Count,
  streak: Count,
  best: Count,
  misses: z.array(MissSchema),
  retry: z.array(z.tuple([z.string(), z.object({ q: QuestionSchema, wrong: Count })])),
})
export type VocabQuizSnapshot = z.infer<typeof VocabQuizSnapshot>

/** Plain JSON for `save_section_state`. */
export function snapshotVocabQuiz(quiz: VocabQuiz): VocabQuizSnapshot {
  const s = quiz.state
  const q = (x: Question) => QuestionSchema.parse(x)
  return {
    v: 1,
    pool: [...quiz.pool],
    preMastered: [...quiz.preMastered],
    built: [...quiz.built],
    queue: [...s.queue],
    counts: [...s.counts],
    current: s.current,
    question: s.question && q(s.question),
    order: [...s.order],
    picked: s.picked,
    tries: s.tries,
    wrong: s.wrong,
    streak: s.streak,
    best: s.best,
    misses: [...s.misses.values()],
    retry: [...s.retry].map(([k, r]) => [k, { q: q(r.q), wrong: r.wrong }] as [string, { q: z.infer<typeof QuestionSchema>; wrong: number }]),
  }
}

/** A stored question still describes `item` in its direction: prompt matches and the answer is the target. */
function questionFits(q: z.infer<typeof QuestionSchema>, item: VocabItem | undefined): boolean {
  if (!item) return false
  const answerText = q.options[q.answer]
  return q.prompt === vocabPrompt(item, q.kind) && answerText !== undefined && answerText === vocabTarget(item, q.kind)
}

const isPermutation = (order: number[], n: number) => order.length === n && [...order].sort((a, b) => a - b).every((x, i) => x === i)

/**
 * Resume from a snapshot. Anything malformed or no longer matching `pkg`
 * (unknown ids, pool mismatch, a stored question whose texts changed) falls
 * back to a fresh run — it never throws. `preMastered` is used only for that
 * fresh run.
 */
export function restoreVocabQuiz(snapshot: unknown, pkg: Pick<LessonPackage, 'vocabulary'>, rng: Rng, preMastered: readonly string[] = []): VocabQuiz {
  const fresh = () => startVocabQuiz(pkg, rng, preMastered)
  const parsed = VocabQuizSnapshot.safeParse(snapshot)
  if (!parsed.success) return fresh()
  const snap = parsed.data
  const items = new Map(pkg.vocabulary.map((v) => [v.id, v]))
  const pool = new Set(snap.pool)
  const known = (id: string) => pool.has(id)
  const countsKeys = snap.counts.map(([k]) => k)
  const ok =
    pool.size === snap.pool.length &&
    snap.pool.length + snap.preMastered.length === items.size &&
    [...snap.pool, ...snap.preMastered].every((id) => items.has(id)) &&
    snap.preMastered.every((id) => !pool.has(id)) &&
    countsKeys.length === pool.size &&
    countsKeys.every(known) &&
    snap.queue.every(known) &&
    snap.built.every(([k]) => known(k)) &&
    (snap.current === null ? snap.question === null : known(snap.current) && snap.question !== null && questionFits(snap.question, items.get(snap.current))) &&
    (snap.question === null || (snap.question.answer < snap.question.options.length && isPermutation(snap.order, snap.question.options.length))) &&
    (snap.picked === null || (snap.question !== null && snap.picked < snap.question.options.length)) &&
    snap.wrong <= snap.tries &&
    snap.retry.every(([k, r]) => known(k) && r.q.answer < r.q.options.length && questionFits(r.q, items.get(k)))
  if (!ok) return fresh()
  const state: RunState<string> = {
    queue: snap.queue,
    counts: new Map(snap.counts),
    current: snap.current,
    question: snap.question,
    order: snap.order,
    picked: snap.picked,
    tries: snap.tries,
    wrong: snap.wrong,
    streak: snap.streak,
    best: snap.best,
    misses: new Map(snap.misses.map((m) => [m.label, m])),
    retry: new Map(snap.retry),
  }
  return { state, items, pool: snap.pool, preMastered: snap.preMastered, built: new Map(snap.built) }
}
