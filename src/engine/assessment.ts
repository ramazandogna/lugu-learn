/**
 * The final assessment sitting: short quiz, then the reading passage (true/false
 * and fill-in questions), on top of the ported `exam.ts` sitting.
 *
 * Rules:
 * - Works WITHOUT answer keys: the student client receives the package with
 *   the assessment's keys stripped, so nothing here grades. The client submits
 *   `submission()` to `submit_assessment`, and the score shown comes from the
 *   server's result.
 * - No hints and no explanations: views carry only id, type, prompt and
 *   options/tokens, even if a full question is passed in.
 * - Answers can be changed until submit; afterwards every change is ignored.
 * - `unansweredList` is the warning shown before submitting; submitting with
 *   blanks is allowed (blanks are scored wrong by the server).
 */
import { z } from 'zod'

import { choose, go, isExamState, newSitting, submit, type ExamItem, type ExamState } from './exam'
import type { Rng } from './mastery'
import { isComplete, matchesTokens, newOrderState, OrderStateSchema, orderResponse, type OrderState } from './order'

/** An assessment question as the student client receives it (keys may be absent). */
export type AssessmentQuestionInput =
  | { id: string; type: 'choice'; prompt: string; options: string[] }
  | { id: string; type: 'order'; prompt: string; tokens: string[] }
  | { id: string; type: 'text'; prompt: string }

export interface AssessmentInput {
  quiz: AssessmentQuestionInput[]
  reading: { title: string; paragraphs: string[]; questions: AssessmentQuestionInput[] }
}

export type AssessmentPart = 'quiz' | 'reading'

/** What the UI renders for one question: no hint, explanation or key. */
export type AssessmentView = AssessmentQuestionInput & { part: AssessmentPart; no: number }

function toView(q: AssessmentQuestionInput, part: AssessmentPart, no: number): AssessmentView {
  switch (q.type) {
    case 'choice':
      return { id: q.id, type: 'choice', prompt: q.prompt, options: [...q.options], part, no }
    case 'order':
      return { id: q.id, type: 'order', prompt: q.prompt, tokens: [...q.tokens], part, no }
    case 'text':
      return { id: q.id, type: 'text', prompt: q.prompt, part, no }
  }
}

export interface AssessmentSitting {
  views: AssessmentView[]
  reading: { title: string; paragraphs: string[] }
  /** Choice answers, navigation and the submitted flag live in the exam sitting. */
  exam: ExamState
  /** Exam items for `choose`; `answer` is -1 because the client has no key. */
  items: Map<string, ExamItem>
  text: Record<string, string>
  order: Record<string, OrderState>
}

function build(a: AssessmentInput) {
  const views = [...a.quiz.map((q, i) => toView(q, 'quiz', i + 1)), ...a.reading.questions.map((q, i) => toView(q, 'reading', i + 1))]
  const items = new Map<string, ExamItem>(
    views.flatMap((v) => (v.type === 'choice' ? [[v.id, { id: v.id, no: v.no, answer: -1, options: v.options.length, topic: v.part }] as const] : [])),
  )
  return { views, items, reading: { title: a.reading.title, paragraphs: [...a.reading.paragraphs] } }
}

export function startAssessment(a: AssessmentInput, rng: Rng, now: number): AssessmentSitting {
  const { views, items, reading } = build(a)
  const order: Record<string, OrderState> = {}
  for (const v of views) if (v.type === 'order') order[v.id] = newOrderState(v.tokens, rng)
  return { views, reading, items, exam: newSitting(views.map((v) => v.id), 'exam', null, now), text: {}, order }
}

const viewOf = (s: AssessmentSitting, id: string) => s.views.find((v) => v.id === id)

/** Pick an ORIGINAL option index for a choice question. */
export function chooseOption(s: AssessmentSitting, id: string, option: number) {
  choose(s.exam, id, option, s.items)
}

export function setText(s: AssessmentSitting, id: string, value: string) {
  if (!s.exam.submitted && viewOf(s, id)?.type === 'text') s.text[id] = value
}

export function setOrderAnswer(s: AssessmentSitting, id: string, state: OrderState) {
  const v = viewOf(s, id)
  if (!s.exam.submitted && v?.type === 'order' && matchesTokens(state, v.tokens)) s.order[id] = state
}

/** Jump to question `index` (0-based, across both parts). */
export const goTo = (s: AssessmentSitting, index: number) => go(s.exam, index)

export const currentView = (s: AssessmentSitting) => s.views[s.exam.current] ?? null

function responseOf(s: AssessmentSitting, v: AssessmentView): number | string | string[] | undefined {
  if (v.type === 'choice') return s.exam.answers[v.id]
  if (v.type === 'text') {
    const t = s.text[v.id]
    return t !== undefined && t.trim() !== '' ? t : undefined
  }
  const o = s.order[v.id]
  return o && isComplete(o) ? orderResponse(o) : undefined
}

/** Questions without an answer yet, in order: the pre-submit warning. */
export const unansweredList = (s: AssessmentSitting) =>
  s.views.filter((v) => responseOf(s, v) === undefined).map(({ id, part, no }) => ({ id, part, no }))

/** `{ questionId: response }` for `submit_assessment`; blanks are left out. */
export function submission(s: AssessmentSitting): Record<string, number | string | string[]> {
  const out: Record<string, number | string | string[]> = {}
  for (const v of s.views) {
    const r = responseOf(s, v)
    if (r !== undefined) out[v.id] = r
  }
  return out
}

/** Lock the answers. Call before sending `submission()`; the score comes from the server. */
export const submitAssessment = (s: AssessmentSitting) => submit(s.exam)

/* ── snapshot / restore ───────────────────────────────────────────────── */

export const AssessmentSnapshot = z.object({
  v: z.literal(1),
  exam: z.unknown().refine(isExamState),
  text: z.record(z.string(), z.string()),
  order: z.record(z.string(), OrderStateSchema),
})
export type AssessmentSnapshot = { v: 1; exam: ExamState; text: Record<string, string>; order: Record<string, OrderState> }

export const snapshotAssessment = (s: AssessmentSitting): AssessmentSnapshot => ({
  v: 1,
  exam: structuredClone(s.exam),
  text: { ...s.text },
  order: structuredClone(s.order),
})

/** Resume, or a fresh sitting when the snapshot is malformed or for other questions. Never throws. */
export function restoreAssessment(snapshot: unknown, a: AssessmentInput, rng: Rng, now: number): AssessmentSitting {
  const parsed = AssessmentSnapshot.safeParse(snapshot)
  const exam = parsed.success ? parsed.data.exam : null
  if (!parsed.success || !isExamState(exam)) return startAssessment(a, rng, now)
  const { text, order } = parsed.data
  const { views, items, reading } = build(a)
  const ids = views.map((v) => v.id)
  const byId = new Map(views.map((v) => [v.id, v]))
  const ok =
    exam.ids.length === ids.length &&
    exam.ids.every((id, i) => id === ids[i]) &&
    exam.current < ids.length &&
    Object.entries(exam.answers).every(([id, n]) => {
      const it = items.get(id)
      return !!it && n < it.options
    }) &&
    Object.keys(text).every((id) => byId.get(id)?.type === 'text') &&
    Object.entries(order).every(([id, o]) => {
      const v = byId.get(id)
      return v?.type === 'order' && matchesTokens(o, v.tokens)
    })
  if (!ok) return startAssessment(a, rng, now)
  const fullOrder = { ...order }
  for (const v of views) if (v.type === 'order' && !fullOrder[v.id]) fullOrder[v.id] = newOrderState(v.tokens, rng)
  return { views, reading, items, exam, text, order: fullOrder }
}
