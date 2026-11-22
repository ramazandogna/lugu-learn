import { describe, expect, it } from 'vitest'

import { gradeVocab, normalizeAnswer } from '@/domain/grading'

import { testPackage } from './testing/package'
import {
  answerVocab,
  buildVocabQuestion,
  currentDirection,
  isVocabQuizDone,
  nextVocabQuestion,
  pickDistractors,
  restoreVocabQuiz,
  snapshotVocabQuiz,
  startVocabQuiz,
  vocabQuizProgress,
  type VocabQuiz,
} from './vocab-quiz'

/** Seeded LCG so runs are deterministic but varied. */
const lcg = (seed = 1) => {
  let x = seed
  return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648)
}

const pkg = testPackage()
const items = pkg.vocabulary

const rightIndex = (quiz: VocabQuiz) => quiz.state.question?.answer ?? -1
const wrongIndex = (quiz: VocabQuiz) => (rightIndex(quiz) === 0 ? 1 : 0)

describe('distractors', () => {
  it('prefers the same difficulty, then the nearest', () => {
    const item = items.find((v) => v.id === 'have-breakfast')
    if (!item) throw new Error('fixture')
    const d = pickDistractors(item, items, 'en_tr', lcg(3))
    expect(d).toHaveLength(3)
    // difficulty 1 others: go-to-school, get-up; then one of difficulty 2
    expect(d.slice(0, 2).sort()).toEqual(['kalkmak', 'okula gitmek'])
    expect(['aramak', 'korkmak']).toContain(d[2])
  })

  it('never repeats an option after normalisation and is deterministic', () => {
    const dupes = [
      { id: 'a', en: 'look for', tr: 'aramak', example: { en: 'x', tr: 'y' }, difficulty: 1 },
      { id: 'b', en: 'search', tr: 'Aramak.', example: { en: 'x', tr: 'y' }, difficulty: 1 },
      { id: 'c', en: 'call', tr: 'aramak ', example: { en: 'x', tr: 'y' }, difficulty: 1 },
      { id: 'd', en: 'find', tr: 'bulmak', example: { en: 'x', tr: 'y' }, difficulty: 1 },
    ]
    const [first] = dupes
    if (!first) throw new Error('fixture')
    const q = buildVocabQuestion(first, dupes, 'en_tr', lcg(5))
    expect(q.options).toEqual(['aramak', 'bulmak'])
    expect(new Set(q.options.map(normalizeAnswer)).size).toBe(q.options.length)
    expect(buildVocabQuestion(first, dupes, 'tr_en', lcg(9))).toEqual(buildVocabQuestion(first, dupes, 'tr_en', lcg(9)))
  })

  it('builds direction-aware questions with the answer first', () => {
    const [item] = items
    if (!item) throw new Error('fixture')
    const en = buildVocabQuestion(item, items, 'en_tr', lcg())
    expect(en).toMatchObject({ kind: 'en_tr', prompt: 'have breakfast', answer: 0 })
    expect(en.options[0]).toBe('kahvaltı yapmak')
    const tr = buildVocabQuestion(item, items, 'tr_en', lcg())
    expect(tr).toMatchObject({ kind: 'tr_en', prompt: 'kahvaltı yapmak' })
    expect(tr.options[0]).toBe('have breakfast')
  })
})

describe('vocab quiz', () => {
  it('runs to the end: every item mastered with two correct answers, alternating direction', () => {
    const rng = lcg(7)
    const quiz = startVocabQuiz(pkg, rng)
    const seen = new Map<string, string[]>()
    let guard = 0
    while (!isVocabQuizDone(quiz) && guard++ < 100) {
      const a = answerVocab(quiz, rightIndex(quiz), rng)
      if (!a) throw new Error('not answerable')
      expect(gradeVocab(quiz.items.get(a.vocabId) ?? { en: '', tr: '' }, a.direction, a.chosenText)).toBe(true)
      seen.set(a.vocabId, [...(seen.get(a.vocabId) ?? []), a.direction])
      nextVocabQuestion(quiz, rng)
    }
    expect(guard).toBe(items.length * 2)
    for (const dirs of seen.values()) expect(dirs).toEqual(['en_tr', 'tr_en'])
    expect(vocabQuizProgress(quiz)).toMatchObject({ mastered: 6, total: 6, percent: 100, accuracyPercent: 100 })
  })

  it('a miss resets the count ("two correct since last miss") and keeps the direction', () => {
    const rng = lcg(11)
    const quiz = startVocabQuiz(pkg, rng)
    const id = quiz.state.current
    const dir = currentDirection(quiz)
    const a = answerVocab(quiz, wrongIndex(quiz), rng)
    expect(a?.outcome.correct).toBe(false)
    expect(quiz.state.counts.get(id ?? '')).toBe(0)
    // walk until the same item comes back
    while (quiz.state.current !== id) {
      answerVocab(quiz, rightIndex(quiz), rng)
      nextVocabQuestion(quiz, rng)
    }
    expect(currentDirection(quiz)).toBe(dir)
    expect(vocabQuizProgress(quiz).accuracyPercent).toBeLessThan(100)
  })

  it('leaves pre-mastered items out of the pool but counts them', () => {
    const quiz = startVocabQuiz(pkg, lcg(), ['look-for', 'nope'])
    expect(quiz.pool).not.toContain('look-for')
    expect(quiz.preMastered).toEqual(['look-for'])
    expect(vocabQuizProgress(quiz)).toMatchObject({ mastered: 1, total: 6, accuracyPercent: null })
  })

  it('answering twice or out of range is ignored', () => {
    const rng = lcg(2)
    const quiz = startVocabQuiz(pkg, rng)
    expect(answerVocab(quiz, 99, rng)).toBeNull()
    expect(answerVocab(quiz, 0, rng)).not.toBeNull()
    expect(answerVocab(quiz, 0, rng)).toBeNull()
  })
})

describe('vocab quiz snapshot', () => {
  it('round-trips through JSON mid-quiz and continues identically', () => {
    const rng = lcg(4)
    const quiz = startVocabQuiz(pkg, rng)
    answerVocab(quiz, wrongIndex(quiz), rng)
    nextVocabQuestion(quiz, rng)
    answerVocab(quiz, rightIndex(quiz), rng)
    const json = JSON.parse(JSON.stringify(snapshotVocabQuiz(quiz))) as unknown
    const back = restoreVocabQuiz(json, pkg, lcg(99))
    expect(snapshotVocabQuiz(back)).toEqual(snapshotVocabQuiz(quiz))
    const r1 = lcg(5)
    const r2 = lcg(5)
    nextVocabQuestion(quiz, r1)
    nextVocabQuestion(back, r2)
    expect(back.state.question).toEqual(quiz.state.question)
    expect(back.state.current).toBe(quiz.state.current)
  })

  it.each([
    ['garbage', 'not json'],
    ['null', null],
    ['wrong version', { v: 2 }],
  ])('falls back to a fresh run on %s', (_, snap) => {
    const quiz = restoreVocabQuiz(snap, pkg, lcg())
    expect(quiz.state.tries).toBe(0)
    expect(quiz.state.current).not.toBeNull()
  })

  it('falls back when the snapshot no longer matches the package', () => {
    const rng = lcg(6)
    const quiz = startVocabQuiz(pkg, rng)
    answerVocab(quiz, rightIndex(quiz), rng)
    const snap = snapshotVocabQuiz(quiz)
    const other = testPackage({
      vocabulary: pkg.vocabulary.map((v) => (v.id === snap.current ? { ...v, tr: 'değişti', en: 'changed' } : v)),
    })
    expect(restoreVocabQuiz(snap, other, lcg()).state.tries).toBe(0)
    expect(restoreVocabQuiz({ ...snap, queue: [...snap.queue, 'ghost'] }, pkg, lcg()).state.tries).toBe(0)
    expect(restoreVocabQuiz({ ...snap, order: [0, 0, 1, 2] }, pkg, lcg()).state.tries).toBe(0)
    expect(restoreVocabQuiz(snap, pkg, lcg()).state.tries).toBe(1)
  })
})
