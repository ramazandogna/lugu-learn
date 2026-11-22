import { describe, expect, it } from 'vitest'

import { testPackage } from './testing/package'
import {
  answerStage,
  currentQuestion,
  homeworkProgress,
  isHomeworkDone,
  restoreHomework,
  revealHint,
  setOrder,
  snapshotHomework,
  startHomework,
} from './homework'
import { place } from './order'

const rng = () => 0.42
const pkg = testPackage()

describe('homework', () => {
  it('walks complete → order → meaning per group, retrying a wrong stage', () => {
    const hw = startHomework(pkg, rng)
    expect(hw.current).toEqual({ group: 0, stage: 'complete' })
    expect(answerStage(hw, 1, rng)).toMatchObject({ questionId: 'hw-1-c', correct: false, attemptNo: 1, groupDone: false })
    expect(hw.current).toEqual({ group: 0, stage: 'complete' })
    expect(answerStage(hw, 0, rng)).toMatchObject({ correct: true, attemptNo: 2 })
    expect(hw.current).toEqual({ group: 0, stage: 'order' })
    expect(hw.order?.pool).toHaveLength(3)
    expect(answerStage(hw, ['I', 'have', 'breakfast'], rng)?.correct).toBe(true)
    expect(answerStage(hw, 'Kahvaltı yaparım.', rng)).toMatchObject({ correct: true, groupDone: true })
    expect(hw.current).toEqual({ group: 1, stage: 'complete' })
    expect(hw.stats['hw-1']?.complete).toMatchObject({ attempts: 2, errors: 1, solved: true })
    expect(homeworkProgress(hw)).toEqual({ groupsDone: 1, groups: 2 })
  })

  it('grades the placed tokens when no response is given', () => {
    const hw = startHomework(pkg, rng)
    answerStage(hw, 0, rng)
    const q = currentQuestion(hw)
    if (q?.type !== 'order' || !hw.order) throw new Error('expected order stage')
    let s = hw.order
    for (const word of q.answer) s = place(s, s.pool.findIndex((t) => t.text === word))
    setOrder(hw, s)
    expect(answerStage(hw, undefined, rng)?.correct).toBe(true)
  })

  it('rejects an order state that does not belong to the question', () => {
    const hw = startHomework(pkg, rng)
    answerStage(hw, 0, rng)
    const before = hw.order
    setOrder(hw, { pool: [], placed: [{ id: '0', text: 'nope' }] })
    expect(hw.order).toBe(before)
  })

  it('counts a hint once per attempt and reports it with the answer', () => {
    const hw = startHomework(pkg, rng)
    expect(revealHint(hw)).toBe('I ile')
    revealHint(hw)
    expect(hw.stats['hw-1']?.complete.hintsUsed).toBe(1)
    expect(answerStage(hw, 1, rng)?.hintUsed).toBe(true)
    expect(answerStage(hw, 0, rng)?.hintUsed).toBe(false)
    expect(revealHint(hw)).toBeNull() // order stage has no hint
  })

  it('finishes when every stage of every group is solved', () => {
    const hw = startHomework(pkg, rng)
    for (const r of [0, ['I', 'have', 'breakfast'], 'kahvaltı yaparım', 1, ['She', 'goes', 'to', 'school'], 0]) answerStage(hw, r, rng, 1500)
    expect(isHomeworkDone(hw)).toBe(true)
    expect(answerStage(hw, 0, rng)).toBeNull()
    expect(hw.stats['hw-2']?.meaning.ms).toBe(1500)
  })

  it('snapshot round-trips through JSON, including the order in progress', () => {
    const hw = startHomework(pkg, rng)
    answerStage(hw, 0, rng)
    if (!hw.order) throw new Error('expected order')
    setOrder(hw, place(hw.order, 0))
    const snap = JSON.parse(JSON.stringify(snapshotHomework(hw))) as unknown
    const back = restoreHomework(snap, pkg, () => 0.9)
    expect(back.current).toEqual(hw.current)
    expect(back.order).toEqual(hw.order)
    expect(back.stats).toEqual(hw.stats)
  })

  it('falls back to a fresh start on a corrupt or foreign snapshot', () => {
    expect(restoreHomework({ v: 1, junk: true }, pkg, rng).stats['hw-1']?.complete.attempts).toBe(0)
    const hw = startHomework(pkg, rng)
    answerStage(hw, 0, rng)
    const snap = snapshotHomework(hw)
    expect(restoreHomework({ ...snap, groupIds: ['hw-2', 'hw-1'] }, pkg, rng).current).toEqual({ group: 0, stage: 'complete' })
    const badOrder = restoreHomework({ ...snap, order: { pool: [], placed: [{ id: '0', text: 'x' }] } }, pkg, rng)
    expect(badOrder.order?.pool).toHaveLength(3)
  })
})
