import { describe, expect, it } from 'vitest'
import { computeObservedFacts, teacherObservations } from '../../supabase/functions/_shared/ai/insights/observed.ts'
import { buildInsightContext, runInsightsJob } from '../../supabase/functions/_shared/ai/insights/pipeline.ts'
import { containsPersonalName, scrubText } from '../../supabase/functions/_shared/ai/privacy.ts'
import { buildLessonContextBlocks } from '../../supabase/functions/_shared/ai/context.ts'
import { FakeModel, lessonContextFixture, MemoryJobs } from './fixtures/pipeline.ts'
import { learnerSnapshot, MemoryInsights, STUDENT_ID } from './fixtures/learner.ts'

const NAMES = ['Ayşe', 'AYŞE', 'ayşe', 'Yılmaz', 'Ayşecik', 'LUGU-1042', 'ayse@example.com', 'Atatürk Ortaokulu']

describe('privacy: no student personal data in prompts', () => {
  it('scrubs names (any case), student code and e-mail from teacher notes', () => {
    const s = learnerSnapshot()
    const out = scrubText(s.speakingNotes[0]!.text, s.names)
    for (const n of NAMES) expect(out).not.toContain(n)
    expect(out).toContain('confuses have and has')
    expect(containsPersonalName(out, s.names)).toBe(false)
  })

  it('the insights prompt builder renders no names given a profile with names', () => {
    const s = learnerSnapshot()
    const text = buildInsightContext({
      observed: computeObservedFacts(s, new Date('2026-11-22T00:00:00Z')),
      notes: teacherObservations(s),
      names: s.names,
      grade: s.grade,
      currentLesson: null,
    })
    for (const n of NAMES) expect(text).not.toContain(n)
    expect(text).not.toContain(STUDENT_ID)
    expect(text).toContain('teacher.n1')
  })

  it('no model request of a full insights job contains a name or the student id', async () => {
    const model = new FakeModel().on(
      'learning_profile',
      JSON.stringify({ summary: 'Öğrenci düzenli çalışıyor görünüyor.', statements: [{ kind: 'trend', text: 'Gelişme var.', evidence: ['accuracy.trend'], confidence: 'low' }] }),
    )
    const jobs = new MemoryJobs()
    const { id } = await jobs.create({ kind: 'learning_profile', createdBy: 'a', input: {}, studentId: STUDENT_ID })
    await runInsightsJob({ model, jobs, store: new MemoryInsights() }, id, { action: 'learning_profile', studentId: STUDENT_ID })
    const sent = JSON.stringify(model.requests)
    expect(model.requests.length).toBeGreaterThan(0)
    for (const n of [...NAMES, STUDENT_ID]) expect(sent).not.toContain(n)
  })

  it('lesson context carries curriculum data and anonymised class aggregates only', () => {
    const text = JSON.stringify(buildLessonContextBlocks(lessonContextFixture))
    expect(text).toContain('classWeakItems')
    expect(text).not.toMatch(/student_?id|first_?name|display_?name|LUGU-\d/i)
  })
})
