/**
 * Publishes the "School Life" lesson through the real admin RPCs (works on local and remote Supabase).
 * Curriculum "Örnek Müfredat: School Life" (one version, one lesson): a published version cannot take new
 * lessons, so a separate curriculum keeps the 6th grade program untouched and re-runs trivial.
 * Idempotent: every row is looked up first; a changed package becomes a new revision, an equal one is skipped.
 *
 * Usage:
 *   LUGU_ADMIN_PASSWORD=... pnpm dlx tsx --tsconfig tsconfig.node.json scripts/content/school-life.ts [--assign LUGU-1001]
 * Env: LUGU_SUPABASE_URL (default http://127.0.0.1:54321), LUGU_SUPABASE_ANON_KEY (default VITE_SUPABASE_ANON_KEY
 *      from .env.local), LUGU_ADMIN_EMAIL (default admin@lugu.local), LUGU_ADMIN_PASSWORD.
 * `--assign CODE` also assigns the published version to that student (skipped when already assigned).
 */
import { existsSync, readFileSync } from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { LessonPackage } from '@/domain/content.ts'
import { schoolLifePackageInput, schoolLifeSpeakingPlan, schoolLifeTeacherGuide } from './school-life-package.ts'

const CURRICULUM_NAME = 'Örnek Müfredat: School Life'
const LESSON_TITLE = 'Ünite 1 — School Life'

function localEnv(): Record<string, string> {
  if (!existsSync('.env.local')) return {}
  return Object.fromEntries(
    readFileSync('.env.local', 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  )
}
const fileEnv = localEnv()
const URL = process.env.LUGU_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const ANON = process.env.LUGU_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY ?? ''
const EMAIL = process.env.LUGU_ADMIN_EMAIL ?? 'admin@lugu.local'
const PASSWORD = process.env.LUGU_ADMIN_PASSWORD ?? ''

function must<T>(r: { data: unknown; error: { message: string } | null }, what: string): T {
  if (r.error) throw new Error(`${what}: ${r.error.message}`)
  return r.data as T
}
/** Key-order-independent JSON, to compare a stored package with the one we would publish. */
const canon = (v: unknown) =>
  JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, (x as Record<string, unknown>)[k]])) : x))

async function signIn(): Promise<SupabaseClient> {
  if (!ANON) throw new Error('LUGU_SUPABASE_ANON_KEY is missing (or VITE_SUPABASE_ANON_KEY in .env.local)')
  if (!PASSWORD) throw new Error('LUGU_ADMIN_PASSWORD is missing')
  const c = createClient(URL, ANON, { db: { schema: 'lugu' }, auth: { persistSession: false } }) as unknown as SupabaseClient
  const { error } = await c.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (error) throw new Error(`admin sign in: ${error.message}`)
  return c
}

async function ensureCurriculum(admin: SupabaseClient, pkg: LessonPackage) {
  let curriculum = must<{ id: string } | null>(await admin.from('curricula').select('id').eq('name', CURRICULUM_NAME).limit(1).maybeSingle(), 'curriculum lookup')
  if (!curriculum)
    curriculum = must<{ id: string }>(
      await admin
        .from('curricula')
        .insert({ name: CURRICULUM_NAME, description: 'He / she / it + is konusu, okul hayatı teması. Örnek içerik dersi.', grade: 6, kind: 'custom', status: 'draft', target_level: 'A1' })
        .select()
        .single(),
      'curriculum',
    )
  let version = must<{ id: string; status: string } | null>(
    await admin.from('curriculum_versions').select('id, status').eq('curriculum_id', curriculum.id).order('version', { ascending: false }).limit(1).maybeSingle(),
    'version lookup',
  )
  if (!version) version = must<{ id: string; status: string }>(await admin.from('curriculum_versions').insert({ curriculum_id: curriculum.id, version: 1, status: 'draft' }).select().single(), 'version')

  let objectives = must<{ id: string }[]>(await admin.from('curriculum_objectives').select('id').eq('version_id', version.id).order('sort'), 'objectives')
  if (objectives.length === 0)
    objectives = must<{ id: string }[]>(
      await admin.from('curriculum_objectives').insert(pkg.meta.objectives.map((o, i) => ({ version_id: version!.id, code: o.id, text: o.text, sort: i }))).select(),
      'objectives',
    )

  let lesson = must<{ id: string } | null>(await admin.from('curriculum_lessons').select('id').eq('version_id', version.id).eq('sequence', 1).maybeSingle(), 'lesson lookup')
  if (!lesson)
    lesson = must<{ id: string }>(
      await admin
        .from('curriculum_lessons')
        .insert({ version_id: version.id, sequence: 1, title: LESSON_TITLE, estimated_minutes: pkg.meta.estimatedMinutes, status: 'ready', objective_ids: objectives.map((o) => o.id), source_notes: 'He / she / it + is / isn’t, Is he …?; okul hayatı kelimeleri.' })
        .select()
        .single(),
      'lesson',
    )
  return { version, lesson }
}

/** Publishes a package revision for a lesson unless the same content is already published. Returns the published id. */
async function ensurePublishedPackage(admin: SupabaseClient, lessonId: string, content: unknown): Promise<string> {
  const material = { teacher_guide: schoolLifeTeacherGuide, speaking_plan: schoolLifeSpeakingPlan }
  const published = must<{ id: string; content: unknown } | null>(
    await admin.from('lesson_content_packages').select('id, content').eq('lesson_id', lessonId).eq('status', 'published').maybeSingle(),
    'published package lookup',
  )
  if (published && canon(published.content) === canon(content)) {
    must(await admin.from('lesson_admin_material').upsert({ package_id: published.id, ...material }), 'admin material')
    return published.id
  }
  let id: string
  let from: string
  if (published) {
    id = must<{ id: string }>(await admin.rpc('admin_new_revision', { package_id: published.id, content }), 'new revision').id
    from = 'draft'
  } else {
    const pending = must<{ id: string; status: string } | null>(
      await admin.from('lesson_content_packages').select('id, status').eq('lesson_id', lessonId).in('status', ['draft', 'ai_generated', 'qa', 'review', 'approved']).order('revision', { ascending: false }).limit(1).maybeSingle(),
      'pending package lookup',
    )
    if (pending) {
      must(await admin.from('lesson_content_packages').update({ content }).eq('id', pending.id), 'pending content')
      id = pending.id
      from = pending.status
    } else {
      id = must<{ id: string }>(await admin.from('lesson_content_packages').insert({ lesson_id: lessonId, status: 'draft', content, origin: 'manual', revision: 1 }).select().single(), 'package').id
      from = 'draft'
    }
  }
  must(await admin.from('lesson_admin_material').upsert({ package_id: id, ...material }), 'admin material')
  const chain = ['draft', 'ai_generated', 'qa', 'review', 'approved', 'published']
  for (const status of chain.slice(chain.indexOf(from) + 1)) must(await admin.rpc('admin_set_package_status', { package_id: id, status }), `package → ${status}`)
  return id
}

async function assign(admin: SupabaseClient, code: string, versionId: string, lessonId: string) {
  const student = must<{ user_id: string } | null>(await admin.from('student_profiles').select('user_id').eq('student_code', code).maybeSingle(), 'student lookup')
  if (!student) throw new Error(`student ${code} not found`)
  const open = must<{ id: string } | null>(
    await admin.from('program_assignments').select('id').eq('student_id', student.user_id).eq('curriculum_version_id', versionId).in('status', ['active', 'paused']).limit(1).maybeSingle(),
    'assignment lookup',
  )
  if (open) return console.log(`assign: ${code} already has this program, skipped`)
  must(await admin.rpc('admin_assign_program', { student_id: student.user_id, version_id: versionId, start_lesson_id: lessonId }), 'assign')
  console.log(`assign: ${code} assigned`)
}

async function main() {
  const args = process.argv.slice(2)
  const at = args.indexOf('--assign')
  const assignCode = at >= 0 ? args[at + 1] : undefined
  if (at >= 0 && !assignCode) throw new Error('--assign needs a student code, e.g. --assign LUGU-1001')

  const pkg = LessonPackage.parse(schoolLifePackageInput)
  const admin = await signIn()
  const { version, lesson } = await ensureCurriculum(admin, pkg)
  const packageId = await ensurePublishedPackage(admin, lesson.id, pkg)
  if (version.status === 'draft') must(await admin.rpc('admin_publish_version', { version_id: version.id }), 'publish version')
  if (assignCode) await assign(admin, assignCode, version.id, lesson.id)
  console.log(`done: "${CURRICULUM_NAME}" version ${version.id}, lesson ${lesson.id}, published package ${packageId}`)
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
