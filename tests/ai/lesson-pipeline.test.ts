import { describe, expect, it } from 'vitest'
import { AdminLessonMaterial, LessonPackage, QaReport } from '@/domain/content.ts'
import { advanceLessonJob, LessonJobState, runLessonJob } from '../../supabase/functions/_shared/ai/lesson-pipeline.ts'
import type { ModelClient } from '../../supabase/functions/_shared/ai/model.ts'
import { contentParts, happyLessonModel, MemoryJobs, MemoryLessons, planFixture } from './fixtures/pipeline.ts'

const input = { lessonId: '00000000-0000-4000-8000-000000000101', includeClassWeakItems: true }

async function setup(model: ModelClient) {
  const jobs = new MemoryJobs()
  const lessons = new MemoryLessons()
  const { id } = await jobs.create({ kind: 'lesson_package', createdBy: 'admin-1', input, lessonId: input.lessonId })
  return { jobs, lessons, id, deps: { model, jobs, lessons } }
}

describe('lesson pipeline', () => {
  it('produces a valid LessonPackage, AdminLessonMaterial and QaReport and never publishes', async () => {
    const model = happyLessonModel()
    const { jobs, lessons, id, deps } = await setup(model)

    const result = await runLessonJob(deps, id, input)

    expect(result.status).toBe('succeeded')
    expect(lessons.drafts).toHaveLength(1)
    const draft = lessons.drafts[0]!
    expect(LessonPackage.safeParse(draft.content).success).toBe(true)
    expect(AdminLessonMaterial.safeParse(draft.admin).success).toBe(true)
    expect(QaReport.parse(draft.qaReport).passed).toBe(true)
    expect(draft.content.vocabulary).toHaveLength(15)

    const job = jobs.rows.get(id)!
    expect(job.status).toBe('succeeded')
    expect(job.packageId).toBe('pkg-1')
    const stages = job.history.map((h) => h.stage).filter(Boolean)
    expect(stages).toEqual(expect.arrayContaining(['plan', 'content_core', 'content_practice', 'content_assessment', 'qa_round_0', 'admin_material', 'save', 'done']))
    expect(model.requests.map((r) => r.stage)).toEqual(['plan', 'content_core', 'content_practice', 'content_assessment', 'qa_round_0', 'admin_material'])
  })

  it('opens every call with the same system prompt and context blocks (cacheable prefix)', async () => {
    const model = happyLessonModel()
    const { id, deps } = await setup(model)
    await runLessonJob(deps, id, input)
    const [first, ...rest] = model.requests
    for (const r of rest) {
      expect(r.system).toBe(first!.system)
      expect(r.context).toEqual(first!.context)
    }
    expect(first!.context[0]).toMatchObject({ type: 'text' })
    expect(JSON.stringify(first!.context)).toContain('Unit 2 – My Day')
    expect(first!.jsonSchema).toMatchObject({ type: 'object', additionalProperties: false })
  })

  it('repairs invalid JSON once and succeeds', async () => {
    const model = happyLessonModel().on('content_core', 'Sure! Here is the lesson: {not json', JSON.stringify(contentParts().core))
    const { jobs, id, deps } = await setup(model)

    const result = await runLessonJob(deps, id, input)

    expect(result.status).toBe('succeeded')
    const repair = model.requests.find((r) => r.stage === 'content_core:repair')
    expect(repair).toBeDefined()
    expect(repair!.instruction).toContain('<validation_errors>')
    expect(repair!.instruction).toContain('invalid JSON')
    expect(jobs.rows.get(id)!.status).toBe('succeeded')
  })

  it('fails the job with the validation errors when the repair is invalid too', async () => {
    const model = happyLessonModel().on('plan', JSON.stringify({ analysis: { level: 'A1' } }))
    const { jobs, lessons, id, deps } = await setup(model)

    const result = await runLessonJob(deps, id, input)

    expect(result.status).toBe('failed')
    expect(model.calls('plan')).toHaveLength(2)
    const job = jobs.rows.get(id)!
    expect(job.status).toBe('failed')
    expect(job.error).toMatch(/^plan: output failed validation after one repair attempt/)
    expect(job.error).toContain('analysis.objectives')
    expect(lessons.drafts).toHaveLength(0)
  })

  it('feeds cross-part reference errors back for repair (unknown vocabId in homework)', async () => {
    const practice = contentParts().practice
    const broken = structuredClone(practice)
    broken.homework.groups[0]!.complete.vocabId = 'v-does-not-exist'
    const model = happyLessonModel().on('content_practice', JSON.stringify(broken), JSON.stringify(practice))
    const { id, deps } = await setup(model)

    expect((await runLessonJob(deps, id, input)).status).toBe('succeeded')
    expect(model.requests.find((r) => r.stage === 'content_practice:repair')!.instruction).toContain('unknown vocabId v-does-not-exist')
  })

  it('revises only the failing section and stops after 2 revision rounds', async () => {
    const story = contentParts().core.story
    const model = happyLessonModel()
      .on('qa_round', JSON.stringify({ issues: [{ severity: 'blocker', section: 'story', message: 'st-wake-time: answer key disputed' }] }))
      .on('revision', JSON.stringify({ story }))
    const { lessons, id, deps } = await setup(model)

    const result = await runLessonJob(deps, id, input)

    expect(result.status).toBe('succeeded')
    if (result.status !== 'succeeded') return
    expect(result.revisionRounds).toBe(2)
    expect(model.calls('revision')).toHaveLength(2)
    expect(model.calls('qa_round')).toHaveLength(3)
    const rev = model.calls('revision')[0]!
    expect(rev.instruction).toContain('<sections_to_replace>\nstory\n</sections_to_replace>')
    expect(Object.keys((rev.jsonSchema as { properties: object }).properties)).toEqual(['story'])
    // Still blocked after the cap: saved as an ai_generated draft with a failing report for the admin.
    expect(lessons.drafts[0]!.qaReport.passed).toBe(false)
    expect(lessons.drafts[0]!.qaReport.issues.some((i) => i.severity === 'blocker')).toBe(true)
  })

  it('accepts a revision that fixes the blocker and passes QA', async () => {
    const model = happyLessonModel()
      .on(
        'qa_round',
        JSON.stringify({ issues: [{ severity: 'blocker', section: 'assessment', message: 'rd-tf-late is ambiguous' }] }),
        JSON.stringify({ issues: [] }),
      )
      .on('revision', JSON.stringify({ assessment: contentParts().assessment.assessment }))
    const { lessons, id, deps } = await setup(model)
    const result = await runLessonJob(deps, id, input)
    expect(result.status === 'succeeded' && result.revisionRounds).toBe(1)
    expect(lessons.drafts[0]!.qaReport.passed).toBe(true)
  })

  it('checkpoints after each step so a later invocation continues where it stopped', async () => {
    const model = happyLessonModel()
    const { jobs, lessons, id, deps } = await setup(model)
    const oneStep = { maxSteps: 1, budgetMs: Number.POSITIVE_INFINITY, clock: () => 0 }

    const first = await advanceLessonJob(deps, id, input, oneStep)
    expect(first).toEqual({ status: 'paused', step: 'content_core' })
    const cp = LessonJobState.parse((jobs.rows.get(id)!.output as { checkpoint: unknown }).checkpoint)
    expect(cp.plan).toEqual(planFixture)
    expect(cp.usage.calls).toBe(1)

    let result = first
    for (let i = 0; i < 10 && result.status === 'paused'; i++) result = await advanceLessonJob(deps, id, input, oneStep)
    expect(result.status).toBe('succeeded')
    expect(model.requests).toHaveLength(6)
    expect(lessons.drafts).toHaveLength(1)
  })

  it('fails immediately on a refusal without a repair attempt', async () => {
    const stages: string[] = []
    const refusing: ModelClient = {
      model: 'fake-model',
      generate: async (req) => {
        stages.push(req.stage)
        return { text: '', stopReason: 'refusal', model: 'fake-model', usage: { inputTokens: 1, outputTokens: 0, cacheReadInputTokens: 0, cacheCreationInputTokens: 0 } }
      },
    }
    const { jobs, id, deps } = await setup(refusing)
    const result = await runLessonJob(deps, id, input)
    expect(result.status).toBe('failed')
    expect(stages).toEqual(['plan'])
    expect(jobs.rows.get(id)!.error).toContain('declined')
  })
})
