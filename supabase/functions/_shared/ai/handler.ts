/**
 * HTTP handling for `ai-generate` and `ai-insights`, runtime-agnostic. The
 * Deno entry files only build {@link EdgeDeps} from the environment and call
 * these functions.
 *
 * Every request is authorised first: the caller's JWT must belong to an
 * active admin (read from `lugu.profiles` with a client bound to that JWT).
 * Only then is the service role used, for job and content writes.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { InsightsRequest } from '@/domain/insights.ts'
import { z } from 'zod'
import { advanceLessonJob, LessonJobInput, type AdvanceLimits, type LessonPipelineDeps } from './lesson-pipeline.ts'
import { runInsightsJob, type InsightsDeps } from './insights/pipeline.ts'
import type { ModelClient } from './model.ts'
import type { InsightsStore, JobStore, LessonStore } from './store.ts'

export interface AuthPort {
  /** The caller's user id if the bearer token belongs to an active admin, else null. */
  adminUserId(authorization: string): Promise<string | null>
}

/**
 * Admin check through the caller's own JWT: `auth.getUser()` then
 * `lugu.profiles` under RLS (a user can read their own profile row).
 */
export function supabaseAuth(userClient: (authorization: string) => SupabaseClient): AuthPort {
  return {
    async adminUserId(authorization) {
      const client = userClient(authorization)
      const { data, error } = await client.auth.getUser()
      if (error || !data.user) return null
      const profile = await client.schema('lugu').from('profiles').select('role, status').eq('user_id', data.user.id).maybeSingle()
      const row = profile.data as { role: string; status: string } | null
      return row && row.role === 'admin' && row.status === 'active' ? data.user.id : null
    },
  }
}

export interface EdgeDeps {
  auth: AuthPort
  jobs: JobStore
  /** `null` when ANTHROPIC_API_KEY is not configured. */
  model: ModelClient | null
  /** Keeps a promise alive after the response (EdgeRuntime.waitUntil). */
  waitUntil: (p: Promise<unknown>) => void
  /** CORS headers for this request (shared `_shared/cors.ts` in production). */
  corsHeaders: (req: Request) => Record<string, string>
  log: (msg: string, extra?: Record<string, unknown>) => void
}

export interface GenerateDeps extends EdgeDeps {
  lessons: LessonStore
  limits: () => AdvanceLimits
  /** True when the request carries LUGU_INTERNAL_SECRET in `x-lugu-internal` (constant-time compare). */
  isInternal: (req: Request) => boolean
  /** Fires the next invocation for a paused job (self-call with the internal secret). */
  chain: (jobId: string) => Promise<void>
}

export interface InsightsEdgeDeps extends EdgeDeps {
  store: InsightsStore
}

/** A job with no progress for this long may be resumed by the admin. */
export const STALL_MS = 10 * 60 * 1000

function reply(deps: EdgeDeps, req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...deps.corsHeaders(req) } })
}

async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    return null
  }
}

/** Shared preamble: CORS preflight, method, admin authorisation. Returns the admin id or a Response. */
async function authorise(req: Request, deps: EdgeDeps): Promise<string | Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: deps.corsHeaders(req) })
  if (req.method !== 'POST') return reply(deps, req, 405, { error: 'method_not_allowed' })
  const authorization = req.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return reply(deps, req, 401, { error: 'unauthorized' })
  const userId = await deps.auth.adminUserId(authorization)
  if (!userId) return reply(deps, req, 403, { error: 'forbidden' })
  return userId
}

const GenerateBody = z.union([
  z.object({ action: z.literal('resume'), jobId: z.string().uuid() }),
  LessonJobInput.extend({ action: z.literal('start').default('start') }),
])
const ContinueBody = z.object({ action: z.literal('continue'), jobId: z.string().uuid() })

/** Runs one invocation's share of a lesson job, then chains the next invocation if it paused. */
async function drive(deps: GenerateDeps, jobId: string, input: LessonJobInput): Promise<void> {
  if (!deps.model) return
  const pipelineDeps: LessonPipelineDeps = { model: deps.model, jobs: deps.jobs, lessons: deps.lessons }
  const result = await advanceLessonJob(pipelineDeps, jobId, input, deps.limits())
  deps.log('lesson job step finished', { jobId, status: result.status })
  if (result.status !== 'paused') return
  try {
    await deps.chain(jobId)
  } catch (e) {
    // Leave the job running so the admin can resume it from the checkpoint.
    await deps.jobs.update(jobId, { stage: `stalled:${result.step}`, error: `continuation failed: ${(e as Error).message}` })
  }
}

/**
 * `POST /ai-generate`
 * - `{ lessonId, instructions?, includeClassWeakItems? }` (admin): creates a job, returns `202 { jobId }`.
 * - `{ action: 'resume', jobId }` (admin): continues a stalled job from its checkpoint.
 * - `{ action: 'continue', jobId }` (internal secret only): the self-chained next step.
 */
export async function handleAiGenerate(req: Request, deps: GenerateDeps): Promise<Response> {
  if (req.method === 'POST' && deps.isInternal(req)) {
    const body = ContinueBody.safeParse(await readJson(req))
    if (!body.success) return reply(deps, req, 400, { error: 'invalid_body' })
    const job = await deps.jobs.get(body.data.jobId)
    if (!job || job.kind !== 'lesson_package' || (job.status !== 'running' && job.status !== 'queued'))
      return reply(deps, req, 409, { error: 'job_not_running' })
    if (!(await deps.jobs.claim(job.id, job.updatedAt, `claimed:${job.stage ?? ''}`))) return reply(deps, req, 409, { error: 'job_already_claimed' })
    const input = LessonJobInput.parse(job.input)
    deps.waitUntil(drive(deps, job.id, input))
    return reply(deps, req, 202, { jobId: job.id })
  }

  const auth = await authorise(req, deps)
  if (auth instanceof Response) return auth
  if (!deps.model) return reply(deps, req, 503, { error: 'ai_not_configured' })

  const parsed = GenerateBody.safeParse(await readJson(req))
  if (!parsed.success) return reply(deps, req, 400, { error: 'invalid_body', issues: parsed.error.issues.map((i) => i.message) })

  if (parsed.data.action === 'resume') {
    const job = await deps.jobs.get(parsed.data.jobId)
    if (!job || job.kind !== 'lesson_package') return reply(deps, req, 404, { error: 'job_not_found' })
    const stalled = job.stage?.startsWith('stalled:') || Date.now() - Date.parse(job.updatedAt) > STALL_MS
    if ((job.status !== 'running' && job.status !== 'queued') || !stalled) return reply(deps, req, 409, { error: 'job_not_stalled' })
    if (!(await deps.jobs.claim(job.id, job.updatedAt, `resumed:${job.stage ?? ''}`))) return reply(deps, req, 409, { error: 'job_already_claimed' })
    deps.waitUntil(drive(deps, job.id, LessonJobInput.parse(job.input)))
    return reply(deps, req, 202, { jobId: job.id })
  }

  // Strips `action`: zod objects drop unknown keys.
  const input = LessonJobInput.parse(parsed.data)
  const job = await deps.jobs.create({ kind: 'lesson_package', createdBy: auth, input, lessonId: input.lessonId })
  deps.waitUntil(drive(deps, job.id, input))
  return reply(deps, req, 202, { jobId: job.id })
}

/** `POST /ai-insights` with an {@link InsightsRequest} body (admin): returns `202 { jobId }`. */
export async function handleAiInsights(req: Request, deps: InsightsEdgeDeps): Promise<Response> {
  const auth = await authorise(req, deps)
  if (auth instanceof Response) return auth
  if (!deps.model) return reply(deps, req, 503, { error: 'ai_not_configured' })
  const parsed = InsightsRequest.safeParse(await readJson(req))
  if (!parsed.success) return reply(deps, req, 400, { error: 'invalid_body', issues: parsed.error.issues.map((i) => i.message) })
  const job = await deps.jobs.create({ kind: parsed.data.action, createdBy: auth, input: parsed.data, studentId: parsed.data.studentId })
  const insightsDeps: InsightsDeps = { model: deps.model, jobs: deps.jobs, store: deps.store }
  deps.waitUntil(
    runInsightsJob(insightsDeps, job.id, parsed.data).then((r) => deps.log('insights job finished', { jobId: job.id, status: r.status })),
  )
  return reply(deps, req, 202, { jobId: job.id })
}

/** Constant-time string comparison for the internal continuation secret. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length || !a.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
