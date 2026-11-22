import { describe, expect, it } from 'vitest'

import {
  academicTrend,
  classifySignals,
  computeNet,
  median,
  questionStats,
  sectionTimes,
  subjectTrends,
  vocabDifficulty,
  type AttemptRow,
} from './analytics'

const at = (i: number) => new Date(Date.UTC(2026, 0, 1, 10, 0, i)).toISOString()
const attempt = (i: number, over: Partial<AttemptRow> = {}): AttemptRow => ({
  questionId: `q${i}`,
  section: 'homework',
  attemptNo: 1,
  correct: true,
  responseMs: 3000,
  hintUsed: false,
  at: at(i),
  ...over,
})
const many = (n: number, f: (i: number) => Partial<AttemptRow>) => Array.from({ length: n }, (_, i) => attempt(i, f(i)))
const kinds = (xs: { kind: string }[]) => xs.map((x) => x.kind)

describe('section, question and vocabulary analytics', () => {
  it('section duration and active share', () => {
    expect(
      sectionTimes([
        { section: 'story', startedAt: at(0), completedAt: at(50), activeSeconds: 40, idleSeconds: 10 },
        { section: 'homework', startedAt: at(0), completedAt: null, activeSeconds: 0, idleSeconds: 0 },
      ]),
    ).toEqual([
      { section: 'story', durationSeconds: 50, activeSeconds: 40, idleSeconds: 10, activeShare: 0.8 },
      { section: 'homework', durationSeconds: null, activeSeconds: 0, idleSeconds: 0, activeShare: null },
    ])
  })

  it('per-question accuracy and median latency, hardest first', () => {
    const stats = questionStats([
      attempt(0, { questionId: 'a', correct: false, responseMs: 1000 }),
      attempt(1, { questionId: 'a', attemptNo: 2, responseMs: 3000, hintUsed: true }),
      attempt(2, { questionId: 'b', responseMs: null }),
    ])
    expect(stats[0]).toMatchObject({ questionId: 'a', attempts: 2, correct: 1, accuracy: 0.5, firstTryCorrect: false, medianMs: 2000, hintRate: 0.5 })
    expect(stats[1]).toMatchObject({ questionId: 'b', medianMs: null, firstTryCorrect: true })
    expect(median([5, 1, 3])).toBe(3)
    expect(median([])).toBeNull()
  })

  it('ranks vocabulary by errors', () => {
    const r = vocabDifficulty([
      { itemId: 'x', correctCount: 2, incorrectCount: 1, masteredAt: at(1) },
      { itemId: 'y', correctCount: 0, incorrectCount: 4, masteredAt: null },
    ])
    expect(r.map((v) => [v.itemId, v.repeatedErrors, v.mastered])).toEqual([
      ['y', true, false],
      ['x', false, true],
    ])
  })
})

describe('signals', () => {
  it('says "yeterli veri yok" below the minimum sample and names no pattern', () => {
    const obs = classifySignals({ attempts: many(6, () => ({ responseMs: 9000 })) })
    expect(kinds(obs)).toEqual(['insufficient_data'])
    expect(obs[0]?.text).toContain('yeterli veri yok')
    expect(obs[0]?.evidence).toEqual({ answers: 6, required: 10 })
  })

  it('slow but accurate, with the evidence in the sentence', () => {
    const obs = classifySignals({ attempts: many(25, (i) => ({ responseMs: 8000, correct: i !== 3 && i !== 10 })) })
    const slow = obs.find((o) => o.kind === 'slow_accurate')
    expect(slow?.text).toBe('Yanıtlar yavaş ama büyük ölçüde doğru (%92 doğruluk, ortanca 8 sn).')
    expect(slow?.evidence).toMatchObject({ accuracy: 0.92, medianMs: 8000 })
  })

  it('time alone never yields a label: slow and inaccurate gives no speed observation', () => {
    const obs = classifySignals({ attempts: many(12, (i) => ({ responseMs: 12000, correct: i % 2 === 0 })) })
    expect(kinds(obs)).toEqual([])
  })

  it('fast but inaccurate', () => {
    const obs = classifySignals({ attempts: many(12, (i) => ({ responseMs: 1500, correct: i % 3 === 0 })) })
    expect(kinds(obs)).toEqual(['fast_inaccurate'])
    expect(obs[0]?.text).toBe('Yanıtlar hızlı verilmiş ve doğruluk düşük (%33 doğruluk, ortanca 1,5 sn).')
  })

  it('repeated errors on a question or a word, with refs', () => {
    const obs = classifySignals({
      attempts: many(3, (i) => ({ questionId: 'q-hard', attemptNo: i + 1, correct: false })),
      vocab: [{ itemId: 'look-for', correctCount: 0, incorrectCount: 5, masteredAt: null }],
    })
    const rep = obs.find((o) => o.kind === 'repeated_errors')
    expect(rep?.refs).toEqual(['q-hard', 'look-for'])
    expect(rep?.evidence).toEqual({ items: 2, maxErrors: 5 })
  })

  it('improving, hint dependent and consistent mastery', () => {
    const improving = classifySignals({ attempts: many(20, (i) => ({ correct: i >= 10 || i % 2 === 0 })) })
    expect(improving.find((o) => o.kind === 'improving')?.text).toBe('Dönemin ikinci yarısında doğruluk arttı (%50 → %100).')
    const hints = classifySignals({ attempts: many(10, (i) => ({ hintUsed: i < 5 })) })
    expect(hints.find((o) => o.kind === 'hint_dependent')?.evidence).toMatchObject({ hints: 5, answers: 10 })
    const steady = classifySignals({ attempts: many(10, () => ({})) })
    expect(kinds(steady)).toEqual(['consistent_mastery'])
  })

  it('repeated abandonment needs enough sessions', () => {
    const s = (status: 'completed' | 'abandoned' | 'active') => ({ status, startedAt: at(0) })
    const few = classifySignals({ attempts: many(10, () => ({})), sessions: [s('abandoned'), s('abandoned'), s('active')] })
    expect(few.find((o) => o.scope === 'sessions')?.text).toContain('yeterli veri yok')
    const enough = classifySignals({ attempts: [], sessions: [s('abandoned'), s('completed'), s('abandoned'), s('completed')] })
    expect(enough.find((o) => o.kind === 'repeated_abandonment')?.text).toBe('Son 4 oturumdan 2 tanesi tamamlanmadan bırakıldı.')
  })

  it('sentences avoid judgment words', () => {
    const all = [
      ...classifySignals({ attempts: many(25, () => ({ responseMs: 1000, correct: false })) }),
      ...classifySignals({ attempts: many(25, () => ({ responseMs: 9000 })) }),
    ]
    for (const o of all) expect(o.text).not.toMatch(/zayıf|tembel|başarısız|dikkatsiz|çünkü/i)
  })
})

describe('academic trends', () => {
  it('computes the net with the wrong-answer penalty', () => {
    expect(computeNet(30, 8)).toBe(28)
    expect(computeNet(30, 9, 1 / 3)).toBe(27)
  })

  it('labels improvement, decline and stable with a threshold', () => {
    const up = academicTrend(
      [
        { date: '2026-03-01', net: 22 },
        { date: '2026-01-01', net: 18 },
        { date: '2026-02-01', net: 20 },
      ],
      'Matematik',
    )
    expect(up).toMatchObject({ latest: 22, previous: 20, changePercent: 10, vsAveragePercent: 15.8, label: 'improvement' })
    expect(up.text).toBe('Matematik neti son iki sınav arasında %10 arttı (20 → 22).')
    const flat = academicTrend([{ date: '1', net: 20 }, { date: '2', net: 20.5 }], 'Fen')
    expect(flat.label).toBe('stable')
    expect(flat.text).toBe('Fen neti son iki sınavda yaklaşık aynı kaldı (20 → 20,5).')
    expect(academicTrend([{ date: '1', net: 20 }, { date: '2', net: 18 }], 'Türkçe').label).toBe('decline')
  })

  it('does not compute misleading percentages from a zero or negative base', () => {
    const t = academicTrend([{ date: '1', net: -1 }, { date: '2', net: 3 }], 'Sosyal')
    expect(t.changePercent).toBeNull()
    expect(t.label).toBe('improvement')
    expect(t.text).toBe('Sosyal neti son iki sınav arasında 4 net arttı (-1 → 3).')
  })

  it('needs two results', () => {
    const t = academicTrend([{ date: '1', net: 10 }], 'İngilizce')
    expect(t.label).toBe('insufficient_data')
    expect(t.text).toBe('İngilizce için karşılaştırma yapacak kadar sınav yok (1 sınav).')
    const m = subjectTrends(
      [
        { subjectId: 'm', date: '1', net: 1 },
        { subjectId: 'm', date: '2', net: 5 },
        { subjectId: 'f', date: '1', net: 3 },
      ],
      (id) => (id === 'm' ? 'Matematik' : 'Fen'),
    )
    expect(m.get('m')?.label).toBe('improvement')
    expect(m.get('f')?.label).toBe('insufficient_data')
  })

  it('never uses causal language', () => {
    for (const t of [academicTrend([{ date: '1', net: 5 }, { date: '2', net: 9 }], 'X'), academicTrend([{ date: '1', net: 9 }, { date: '2', net: 5 }], 'X')])
      expect(t.text).not.toMatch(/çünkü|nedeniyle|sayesinde|yüzünden/)
  })
})
