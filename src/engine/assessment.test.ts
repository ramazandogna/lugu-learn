import { describe, expect, it } from 'vitest'

import { testPackage } from './testing/package'
import {
  chooseOption,
  currentView,
  goTo,
  restoreAssessment,
  setOrderAnswer,
  setText,
  snapshotAssessment,
  startAssessment,
  submission,
  submitAssessment,
  unansweredList,
  type AssessmentInput,
} from './assessment'
import { place } from './order'

const rng = () => 0.3
const NOW = 1_700_000_000_000

/** What `student_lesson_content` sends: keys removed. */
const stripped: AssessmentInput = {
  quiz: [
    { id: 'aq-1', type: 'choice', prompt: 'He ___ up at 7.', options: ['get', 'gets', 'getting', 'got'] },
    { id: 'aq-2', type: 'text', prompt: 'kahvaltı yapmak = ?' },
    { id: 'aq-3', type: 'order', prompt: 'Cümleyi kur', tokens: ['up', 'I', 'wake'] },
  ],
  reading: {
    title: 'A busy morning',
    paragraphs: ['Momo gets up early.'],
    questions: [
      { id: 'ar-1', type: 'choice', prompt: 'Momo gets up late.', options: ['True', 'False'] },
      { id: 'ar-2', type: 'choice', prompt: 'Momo ___ up early.', options: ['get', 'gets', 'got', 'getting'] },
    ],
  },
}

function fillOrder(s: ReturnType<typeof startAssessment>) {
  let o = s.order['aq-3']
  if (!o) throw new Error('fixture')
  while (o.pool.length) o = place(o, 0)
  setOrderAnswer(s, 'aq-3', o)
}

describe('assessment', () => {
  it('works without keys and lists unanswered questions by part', () => {
    const s = startAssessment(stripped, rng, NOW)
    expect(s.views.map((v) => `${v.part}${v.no}`)).toEqual(['quiz1', 'quiz2', 'quiz3', 'reading1', 'reading2'])
    expect(unansweredList(s)).toHaveLength(5)
    chooseOption(s, 'aq-1', 1)
    setText(s, 'aq-2', '   ')
    expect(unansweredList(s).map((u) => u.id)).toEqual(['aq-2', 'aq-3', 'ar-1', 'ar-2'])
    setText(s, 'aq-2', 'have breakfast')
    fillOrder(s)
    expect(unansweredList(s)).toEqual([
      { id: 'ar-1', part: 'reading', no: 1 },
      { id: 'ar-2', part: 'reading', no: 2 },
    ])
  })

  it('never exposes hints or explanations even from a full package', () => {
    const s = startAssessment(testPackage().assessment, rng, NOW)
    const first = s.views[0]
    expect(first && 'hint' in first).toBe(false)
    expect(first && 'explain' in first).toBe(false)
    expect(first && 'answer' in first).toBe(false)
  })

  it('answers change until submit, then lock; submission omits blanks', () => {
    const s = startAssessment(stripped, rng, NOW)
    chooseOption(s, 'aq-1', 0)
    chooseOption(s, 'aq-1', 2)
    chooseOption(s, 'aq-1', 9) // out of range: ignored
    chooseOption(s, 'aq-2', 0) // not a choice: ignored
    setText(s, 'aq-2', 'have breakfast')
    fillOrder(s)
    expect(submission(s)).toEqual({ 'aq-1': 2, 'aq-2': 'have breakfast', 'aq-3': expect.any(Array) as unknown })
    submitAssessment(s)
    chooseOption(s, 'aq-1', 1)
    setText(s, 'aq-2', 'x')
    chooseOption(s, 'ar-1', 0)
    expect(submission(s)['aq-1']).toBe(2)
    expect(submission(s)['aq-2']).toBe('have breakfast')
    expect(submission(s)['ar-1']).toBeUndefined()
  })

  it('navigates across both parts', () => {
    const s = startAssessment(stripped, rng, NOW)
    goTo(s, 3)
    expect(currentView(s)?.id).toBe('ar-1')
    goTo(s, 99)
    expect(currentView(s)?.id).toBe('ar-2')
  })

  it('snapshot round-trips; a corrupt or foreign one starts fresh', () => {
    const s = startAssessment(stripped, rng, NOW)
    chooseOption(s, 'ar-2', 1)
    setText(s, 'aq-2', 'hi')
    goTo(s, 2)
    const snap = JSON.parse(JSON.stringify(snapshotAssessment(s))) as unknown
    const back = restoreAssessment(snap, stripped, rng, NOW + 1000)
    expect(submission(back)).toEqual(submission(s))
    expect(back.exam.current).toBe(2)
    expect(back.order['aq-3']).toEqual(s.order['aq-3'])
    expect(unansweredList(restoreAssessment({ v: 1, exam: { nope: 1 }, text: {}, order: {} }, stripped, rng, NOW))).toHaveLength(5)
    const fewer = { ...stripped, quiz: stripped.quiz.slice(0, 2) }
    expect(restoreAssessment(snap, fewer, rng, NOW).exam.answers).toEqual({})
    const bad = { ...snapshotAssessment(s), text: { 'aq-1': 'x' } }
    expect(restoreAssessment(bad, stripped, rng, NOW).text).toEqual({})
  })
})
