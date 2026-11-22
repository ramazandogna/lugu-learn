/**
 * Builds the edge dependencies from environment variables. Used by the two
 * Deno entry files; `env` is passed in (`Deno.env.get`) so this module has no
 * runtime globals except the guarded `EdgeRuntime`.
 */
import { createClient } from '@supabase/supabase-js'
import type { EdgeDeps, GenerateDeps, InsightsEdgeDeps } from '../handler.ts'
import { safeEqual, supabaseAuth } from '../handler.ts'
import { supabaseInsightsStore, supabaseJobStore, supabaseLessonStore } from '../supabase-store.ts'
import { anthropicModelClient } from './anthropic.ts'

export type Env = (name: string) => string | undefined

function required(env: Env, name: string): string {
  const v = env(name)
  if (!v) throw new Error(`missing environment variable ${name}`)
  return v
}

/** `EdgeRuntime.waitUntil` when running on Supabase; otherwise the promise just runs. */
function waitUntil(p: Promise<unknown>): void {
  const rt = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime
  const guarded = p.catch((e: unknown) => console.error('background task failed', e))
  if (rt?.waitUntil) rt.waitUntil(guarded)
}

function base(env: Env, fn: string) {
  const url = required(env, 'SUPABASE_URL')
  const anonKey = required(env, 'SUPABASE_ANON_KEY')
  const serviceKey = required(env, 'SUPABASE_SERVICE_ROLE_KEY')
  const apiKey = env('ANTHROPIC_API_KEY')
  const noSession = { auth: { persistSession: false, autoRefreshToken: false } }
  const service = createClient(url, serviceKey, noSession)
  const deps: EdgeDeps = {
    auth: supabaseAuth((authorization) => createClient(url, anonKey, { ...noSession, global: { headers: { Authorization: authorization } } })),
    jobs: supabaseJobStore(service),
    model: apiKey
      ? anthropicModelClient({
          apiKey,
          model: env('LUGU_AI_MODEL'),
          structuredOutput: env('LUGU_AI_STRUCTURED_OUTPUT') !== 'off',
          fallbacks: env('LUGU_AI_FALLBACKS') !== 'off',
        })
      : null,
    waitUntil,
    allowedOrigin: env('LUGU_ALLOWED_ORIGIN') ?? '*',
    log: (msg, extra) => console.log(JSON.stringify({ fn, msg, ...extra })),
  }
  return { ...deps, url, serviceKey, service }
}

export function generateDeps(env: Env): GenerateDeps {
  const b = base(env, 'ai-generate')
  const steps = Number(env('LUGU_AI_STEPS_PER_INVOCATION') ?? '1')
  const budgetMs = Number(env('LUGU_AI_STEP_BUDGET_MS') ?? '60000')
  return {
    ...b,
    lessons: supabaseLessonStore(b.service),
    limits: () => ({ maxSteps: Number.isFinite(steps) && steps >= 1 ? steps : 1, budgetMs, clock: () => Date.now() }),
    isInternal: (req) => safeEqual(req.headers.get('x-lugu-internal') ?? '', b.serviceKey),
    chain: async (jobId) => {
      const res = await fetch(`${b.url}/functions/v1/ai-generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${b.serviceKey}`, 'x-lugu-internal': b.serviceKey },
        body: JSON.stringify({ action: 'continue', jobId }),
      })
      if (res.status !== 202) throw new Error(`continuation returned ${res.status}`)
      await res.body?.cancel()
    },
  }
}

export function insightsDeps(env: Env): InsightsEdgeDeps {
  const b = base(env, 'ai-insights')
  return { ...b, store: supabaseInsightsStore(b.service) }
}
