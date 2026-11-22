import { describe, expect, it } from 'vitest'
import { handleAiGenerate, handleAiInsights, safeEqual, type GenerateDeps } from '../../supabase/functions/_shared/ai/handler.ts'
import { happyLessonModel, MemoryJobs, MemoryLessons } from './fixtures/pipeline.ts'
import { MemoryInsights, STUDENT_ID } from './fixtures/learner.ts'

const LESSON = '00000000-0000-4000-8000-000000000101'

function deps(overrides: Partial<GenerateDeps> = {}) {
  const jobs = new MemoryJobs()
  const lessons = new MemoryLessons()
  const pending: Promise<unknown>[] = []
  const chained: string[] = []
  const d: GenerateDeps = {
    auth: { adminUserId: async (h) => (h === 'Bearer admin-jwt' ? 'admin-1' : null) },
    jobs,
    lessons,
    model: happyLessonModel(),
    waitUntil: (p) => void pending.push(p),
    corsHeaders: () => ({ 'access-control-allow-origin': 'https://lugu.example' }),
    log: () => {},
    limits: () => ({ maxSteps: 1, budgetMs: Number.POSITIVE_INFINITY, clock: () => 0 }),
    isInternal: (req) => req.headers.get('x-lugu-internal') === 'secret',
    chain: async (jobId) => void chained.push(jobId),
    ...overrides,
  }
  return { d, jobs, lessons, pending, chained }
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://fn.local/ai-generate', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) })

describe('edge handlers', () => {
  it('rejects callers that are not active admins before doing anything', async () => {
    const { d, jobs } = deps()
    expect((await handleAiGenerate(post({ lessonId: LESSON }), d)).status).toBe(401)
    expect((await handleAiGenerate(post({ lessonId: LESSON }, { authorization: 'Bearer student-jwt' }), d)).status).toBe(403)
    expect(jobs.rows.size).toBe(0)
  })

  it('creates a job, returns 202 with its id, and chains the next step', async () => {
    const { d, jobs, pending, chained } = deps()
    const res = await handleAiGenerate(post({ lessonId: LESSON }, { authorization: 'Bearer admin-jwt' }), d)
    expect(res.status).toBe(202)
    expect(res.headers.get('access-control-allow-origin')).toBe('https://lugu.example')
    const { jobId } = (await res.json()) as { jobId: string }
    await Promise.all(pending)
    expect(jobs.rows.get(jobId)!.stage).toBe('content_core')
    expect(chained).toEqual([jobId])
  })

  it('continues only with the internal secret, and validates the body', async () => {
    const { d, jobs, pending } = deps()
    const { id } = await jobs.create({ kind: 'lesson_package', createdBy: 'admin-1', input: { lessonId: LESSON, includeClassWeakItems: true } })
    expect((await handleAiGenerate(post({ action: 'continue', jobId: id }, { authorization: 'Bearer x' }), d)).status).toBe(403)
    expect((await handleAiGenerate(post({ action: 'continue', jobId: id }, { 'x-lugu-internal': 'secret' }), d)).status).toBe(202)
    await Promise.all(pending)
    expect(jobs.rows.get(id)!.stage).toBe('content_core')
    expect((await handleAiGenerate(post({ lessonId: 'not-a-uuid' }, { authorization: 'Bearer admin-jwt' }), d)).status).toBe(400)
  })

  it('lets only one of two concurrent resumes claim a stalled job', async () => {
    const { d, jobs } = deps()
    const { id } = await jobs.create({ kind: 'lesson_package', createdBy: 'admin-1', input: { lessonId: LESSON, includeClassWeakItems: true } })
    const row = jobs.rows.get(id)!
    row.status = 'running'
    row.stage = 'stalled:qa'
    const resume = () => handleAiGenerate(post({ action: 'resume', jobId: id }, { authorization: 'Bearer admin-jwt' }), d)
    const statuses = (await Promise.all([resume(), resume()])).map((r) => r.status).sort()
    expect(statuses).toEqual([202, 409])
  })

  it('reports 503 when the model is not configured', async () => {
    const { d } = deps({ model: null })
    expect((await handleAiGenerate(post({ lessonId: LESSON }, { authorization: 'Bearer admin-jwt' }), d)).status).toBe(503)
  })

  it('ai-insights validates the action and creates a student-scoped job', async () => {
    const { d, jobs } = deps()
    const insights = { ...d, store: new MemoryInsights() }
    expect((await handleAiInsights(post({ action: 'nope', studentId: STUDENT_ID }, { authorization: 'Bearer admin-jwt' }), insights)).status).toBe(400)
    const res = await handleAiInsights(post({ action: 'learning_profile', studentId: STUDENT_ID }, { authorization: 'Bearer admin-jwt' }), insights)
    expect(res.status).toBe(202)
    expect([...jobs.rows.values()].at(-1)!.kind).toBe('learning_profile')
  })

  it('compares secrets in constant time and never accepts empty ones', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('', '')).toBe(false)
  })
})
