import { describe, expect, it } from 'vitest'
import { collectEvidenceKeys, LearningProfileInterpretation, SpeakingPlanDraft } from '@/domain/insights.ts'
import { computeObservedFacts, allowedEvidenceKeys, teacherObservations } from '../../supabase/functions/_shared/ai/insights/observed.ts'
import { checkInsightOutput, runInsightsJob } from '../../supabase/functions/_shared/ai/insights/pipeline.ts'
import { adminFixture, FakeModel, MemoryJobs } from './fixtures/pipeline.ts'
import { learnerSnapshot, MemoryInsights, STUDENT_ID } from './fixtures/learner.ts'

const NOW = new Date('2026-11-22T12:00:00Z')

const profileOutput = (evidence: string[]) => ({
  summary: 'Öğrenci son haftada daha doğru cevaplar vermiş görünüyor; he/she ile -s kullanımı hâlâ zorlayıcı olabilir.',
  statements: [
    { kind: 'trend', text: 'Doğruluk oranı ikinci yarıda artmış görünüyor.', evidence: ['accuracy.trend'], confidence: 'medium' },
    { kind: 'repeated_error', text: 'catch → catches dönüşümünde tekrarlayan hata var.', evidence, confidence: 'medium' },
    { kind: 'next_step', text: 'Konuşma dersinde have/has ayrımına kısa bir tekrar faydalı olabilir.', evidence: ['teacher.n1'], confidence: 'low' },
  ],
  openQuestions: ['Dinleme çalışmasında zorlanıyor mu?'],
})

async function setup(kind: 'learning_profile' | 'speaking_plan' | 'weekly_report' | 'academic_insight', model: FakeModel) {
  const jobs = new MemoryJobs()
  const store = new MemoryInsights()
  const { id } = await jobs.create({ kind, createdBy: 'admin-1', input: {}, studentId: STUDENT_ID })
  return { jobs, store, id, deps: { model, jobs, store, now: () => NOW } }
}

describe('observed facts', () => {
  it('computes facts and §15.4 signals in code, each citeable by key', () => {
    const observed = computeObservedFacts(learnerSnapshot(), NOW)
    const keys = observed.facts.map((f) => f.key)
    expect(keys).toEqual(expect.arrayContaining(['attempts.total', 'accuracy.overall', 'response.median_ms', 'hints.rate', 'accuracy.trend', 'vocab.mastered', 'sessions.abandoned']))
    expect(keys).toContain('errors.repeated.hw-2-complete')
    expect(observed.facts.find((f) => f.key === 'errors.repeated.hw-2-complete')?.detail).toBe('Sasha ___ (catch) the bus at eight.')
    expect(keys).toContain('signal.improving')
    expect(keys).toContain('exam.matematik.net_change')
    expect(observed.facts.find((f) => f.key === 'exam.matematik.net_change')?.value).toBe(4)
    for (const f of observed.facts.filter((x) => x.key.startsWith('signal.'))) for (const b of f.basis ?? []) expect(keys).toContain(b)
  })

  it('emits no signal from a small sample', () => {
    const s = learnerSnapshot()
    s.attempts = s.attempts.slice(0, 5)
    const keys = computeObservedFacts(s, NOW).facts.map((f) => f.key)
    expect(keys.filter((k) => k.startsWith('signal.') && k !== 'signal.repeated_abandonment')).toEqual([])
  })
})

describe('insights pipeline', () => {
  it('learning profile: AI statements cite only existing evidence keys and observed/AI/teacher stay separate', async () => {
    const model = new FakeModel().on('learning_profile', JSON.stringify(profileOutput(['errors.repeated.hw-2-complete'])))
    const { store, jobs, id, deps } = await setup('learning_profile', model)

    const r = await runInsightsJob(deps, id, { action: 'learning_profile', studentId: STUDENT_ID })

    expect(r.status).toBe('succeeded')
    const saved = store.profiles[0] as { observed: { facts: { key: string }[] }; aiInterpretation: unknown }
    const ai = LearningProfileInterpretation.parse(saved.aiInterpretation)
    const allowed = allowedEvidenceKeys(computeObservedFacts(learnerSnapshot(), NOW), teacherObservations(learnerSnapshot()))
    for (const k of collectEvidenceKeys(ai)) expect(allowed.has(k)).toBe(true)
    expect(saved).not.toHaveProperty('teacherObservations')
    expect(jobs.rows.get(id)!.status).toBe('succeeded')
  })

  it('rejects an invented evidence key: one repair, then the job fails', async () => {
    const bad = JSON.stringify(profileOutput(['errors.repeated.made-up-item']))
    const model = new FakeModel().on('learning_profile', bad)
    const { store, jobs, id, deps } = await setup('learning_profile', model)

    const r = await runInsightsJob(deps, id, { action: 'learning_profile', studentId: STUDENT_ID })

    expect(r.status).toBe('failed')
    expect(model.requests).toHaveLength(2)
    expect(model.requests[1]!.instruction).toContain('unknown evidence key "errors.repeated.made-up-item"')
    expect(jobs.rows.get(id)!.error).toContain('made-up-item')
    expect(store.profiles).toHaveLength(0)
  })

  it('rejects personality or clinical judgments', () => {
    const allowed = new Set(['accuracy.overall'])
    const out = { summary: 'Öğrenci tembel görünüyor.', statements: [{ kind: 'weakness', text: 'x', evidence: ['accuracy.overall'], confidence: 'low' }] }
    expect(checkInsightOutput(out, allowed).join()).toContain('tembel')
    // Lesson language in a listening script is not scanned.
    expect(checkInsightOutput({ plan: { listening: { script: 'The lazy cat sleeps.' } }, focus: [] }, allowed)).toEqual([])
  })

  it('speaking plan: a 60-minute plan for the current lesson, saved to the speaking session', async () => {
    const draft = { plan: adminFixture.speakingPlan, focus: [{ text: 'catch → catches', evidence: ['errors.repeated.hw-2-complete'], confidence: 'medium' }] }
    const model = new FakeModel().on('speaking_plan', JSON.stringify(draft))
    const { store, id, deps } = await setup('speaking_plan', model)
    const sessionId = '00000000-0000-4000-8000-0000000000bb'

    const r = await runInsightsJob(deps, id, { action: 'speaking_plan', studentId: STUDENT_ID, speakingSessionId: sessionId })

    expect(r.status).toBe('succeeded')
    expect(SpeakingPlanDraft.parse((store.plans[0] as { plan: unknown }).plan).plan.closingTask.task).toBeTruthy()
    expect(store.plans[0]).toMatchObject({ speakingSessionId: sessionId, studentId: STUDENT_ID, jobId: id })
    expect(model.requests[0]!.context[0]).toMatchObject({ type: 'text', text: expect.stringContaining('<current_lesson>') })
  })

  it('weekly report and academic insight cite only their own facts', async () => {
    const week = { weekStart: '2026-11-16', summary: 'Bu hafta az veri var.', highlights: [], concerns: [], nextSteps: [{ text: 'Düzenli çalışma', evidence: ['attempts.total'], confidence: 'low' }] }
    const m1 = new FakeModel().on('weekly_report', JSON.stringify(week))
    const a = await setup('weekly_report', m1)
    expect((await runInsightsJob(a.deps, a.id, { action: 'weekly_report', studentId: STUDENT_ID, weekStart: '2026-11-16' })).status).toBe('succeeded')
    expect(a.store.reports).toHaveLength(1)

    const academic = (key: string) => ({ summary: 'Matematik netleri artmış.', observations: [{ kind: 'improvement', text: 'Matematik netleri son üç sınavda artış göstermiş.', evidence: [key], confidence: 'medium' }] })
    const m2 = new FakeModel().on('academic_insight', JSON.stringify(academic('accuracy.overall')), JSON.stringify(academic('exam.matematik.net_change')))
    const b = await setup('academic_insight', m2)
    expect((await runInsightsJob(b.deps, b.id, { action: 'academic_insight', studentId: STUDENT_ID })).status).toBe('succeeded')
    // First answer cited a lesson fact, which is not part of the academic evidence: repaired.
    expect(m2.requests).toHaveLength(2)
  })
})
