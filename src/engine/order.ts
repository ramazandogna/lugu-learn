/**
 * Sentence-ordering model for tap-to-place (mobile friendly, no drag needed).
 *
 * Every token gets an instance id, so two identical words ("the", "the") stay
 * distinguishable. All operations are pure: they return a new state and leave
 * invalid indices as a no-op (same object back).
 */
import { z } from 'zod'

import { shuffleWith, type Rng } from './mastery'

export interface OrderToken {
  /** Instance id, stable for the question: the token's index in `question.tokens`. */
  id: string
  text: string
}

export interface OrderState {
  /** Tokens not yet placed, in display order. */
  pool: OrderToken[]
  /** The sentence being built, in order. */
  placed: OrderToken[]
}

export const OrderTokenSchema = z.object({ id: z.string(), text: z.string() })
export const OrderStateSchema = z.object({ pool: z.array(OrderTokenSchema), placed: z.array(OrderTokenSchema) })

/**
 * A fresh ordering state: all tokens in the pool, shuffled with `rng`. When the
 * shuffle happens to equal `answer`, it is rotated by one so the student never
 * starts on the solution (only possible to avoid with two or more distinct texts).
 */
export function newOrderState(tokens: readonly string[], rng: Rng, answer?: readonly string[]): OrderState {
  let pool = shuffleWith(
    tokens.map((text, i) => ({ id: String(i), text })),
    rng,
  )
  const same = (p: OrderToken[]) => !!answer && p.length === answer.length && p.every((t, i) => t.text === answer[i])
  if (same(pool) && new Set(tokens).size > 1) {
    for (let r = 1; r < pool.length && same(pool); r++) pool = [...pool.slice(1), ...pool.slice(0, 1)]
  }
  return { pool, placed: [] }
}

/** Move `pool[i]` to the end of the sentence. */
export function place(s: OrderState, i: number): OrderState {
  const t = s.pool[i]
  if (!t) return s
  return { pool: s.pool.filter((_, j) => j !== i), placed: [...s.placed, t] }
}

/** Return `placed[i]` to the end of the pool. */
export function unplace(s: OrderState, i: number): OrderState {
  const t = s.placed[i]
  if (!t) return s
  return { pool: [...s.pool, t], placed: s.placed.filter((_, j) => j !== i) }
}

/** Move a placed token from position `from` to position `to` inside the sentence. */
export function move(s: OrderState, from: number, to: number): OrderState {
  const t = s.placed[from]
  if (!t || to < 0 || to >= s.placed.length || from === to) return s
  const placed = s.placed.filter((_, j) => j !== from)
  placed.splice(to, 0, t)
  return { pool: s.pool, placed }
}

/** Every token placed: the sentence can be checked. */
export const isComplete = (s: OrderState) => s.pool.length === 0 && s.placed.length > 0

/** The response `gradeResponse` and `record_answer` take for an order question. */
export const orderResponse = (s: OrderState) => s.placed.map((t) => t.text)

/**
 * Whether a restored state belongs to `tokens`: the same multiset of instance
 * ids and texts, each id once.
 */
export function matchesTokens(s: OrderState, tokens: readonly string[]): boolean {
  const all = [...s.pool, ...s.placed]
  if (all.length !== tokens.length) return false
  const ids = new Set(all.map((t) => t.id))
  return ids.size === all.length && all.every((t) => tokens[Number(t.id)] === t.text && /^\d+$/.test(t.id))
}
