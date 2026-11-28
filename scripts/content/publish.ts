/**
 * Publishes a hand-authored curriculum (one or more lessons) through the real admin RPCs, on local or remote Supabase.
 * Idempotent: every row is looked up first; a changed package becomes a new revision, an equal one is skipped.
 * Lessons are matched by `sequence` (array position + 1). A published version cannot take new lessons or
 * objectives, so add every lesson before the first publish; later runs may only revise existing packages.
 *
 * Env: LUGU_SUPABASE_URL (default http://127.0.0.1:54321), LUGU_SUPABASE_ANON_KEY (default VITE_SUPABASE_ANON_KEY
 *      from .env.local), LUGU_ADMIN_EMAIL (default admin@lugu.local), LUGU_ADMIN_PASSWORD.
 * CLI flags (see `runCli`): `--assign CODE` assigns the published version to that student (skipped when already
 * assigned); `--check` only validates the content, without network.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { z } from 'zod'
import { LessonPackage, SpeakingPlan, TeacherGuide } from '@/domain/content.ts'

export type PackageInput = z.input<typeof LessonPackage>

export interface ContentLesson {
  /** Shown on the map and in admin, e.g. "Ünite 1.2 — Class Rules". */
  title: string
  sourceNotes: string
  package: PackageInput
  teacherGuide: TeacherGuide
  speakingPlan: SpeakingPlan
}

export interface ContentCurriculum {
  name: string
  description: string
  grade: number
  targetLevel: string
  lessons: ContentLesson[]
}

interface ParsedLesson extends ContentLesson {
  parsed: LessonPackage
}

/** Validates every lesson; objective ids become curriculum objective codes, so they must be unique across lessons. */
export function validateCurriculum(c: ContentCurriculum): ParsedLesson[] {
  const errors: string[] = []
  const codes = new Map<string, string>()
  const parsed = c.lessons.map((l) => {
    const pkg = LessonPackage.safeParse(l.package)
    if (!pkg.success) errors.push(...pkg.error.issues.map((i) => `${l.title}: ${i.path.join('.')} ${i.message}`))
    const guide = TeacherGuide.safeParse(l.teacherGuide)
    if (!guide.success) errors.push(...guide.error.issues.map((i) => `${l.title}: teacherGuide.${i.path.join('.')} ${i.message}`))
    const plan = SpeakingPlan.safeParse(l.speakingPlan)
    if (!plan.success) errors.push(...plan.error.issues.map((i) => `${l.title}: speakingPlan.${i.path.join('.')} ${i.message}`))
    for (const o of l.package.meta.objectives) {
      const owner = codes.get(o.id)
      if (owner && owner !== l.title) errors.push(`${l.title}: objective id "${o.id}" already used by "${owner}"`)
      codes.set(o.id, l.title)
    }
    return { ...l, parsed: pkg.data as LessonPackage }
  })
  if (errors.length) throw new Error(`content invalid:\n  ${errors.join('\n  ')}`)
  return parsed
}

function localEnv(): Record<string, string> {
  if (!existsSync('.env.local')) return {}
  return Object.fromEntries(
    readFileSync('.env.local', 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  )
}

function must<T>(r: { data: unknown; error: { message: string } | null }, what: string): T {
  if (r.error) throw new Error(`${what}: ${r.error.message}`)
  return r.data as T
}
/** Key-order-independent JSON, to compare a stored package with the one we would publish. */
const canon = (v: unknown) =>
  JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, (x as Record<string, unknown>)[k]])) : x))

async function signIn(): Promise<SupabaseClient> {
  const fileEnv = localEnv()
  const url = process.env.LUGU_SUPABASE_URL ?? 'http://127.0.0.1:54321'
  const anon = process.env.LUGU_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY ?? ''
  const email = process.env.LUGU_ADMIN_EMAIL ?? 'admin@lugu.local'
  const password = process.env.LUGU_ADMIN_PASSWORD ?? ''
  if (!anon) throw new Error('LUGU_SUPABASE_ANON_KEY is missing (or VITE_SUPABASE_ANON_KEY in .env.local)')
  if (!password) throw new Error('LUGU_ADMIN_PASSWORD is missing')
  const c = createClient(url, anon, { db: { schema: 'lugu' }, auth: { persistSession: false } }) as unknown as SupabaseClient
  const { error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`admin sign in: ${error.message}`)
  return c
}

type Row = { id: string }

async function ensureVersion(admin: SupabaseClient, c: ContentCurriculum) {
  let curriculum = must<Row | null>(await admin.from('curricula').select('id').eq('name', c.name).limit(1).maybeSingle(), 'curriculum lookup')
  if (!curriculum)
    curriculum = must<Row>(
      await admin.from('curricula').insert({ name: c.name, description: c.description, grade: c.grade, kind: 'custom', status: 'draft', target_level: c.targetLevel }).select().single(),
      'curriculum',
    )
  const version =
    must<{ id: string; status: string } | null>(
      await admin.from('curriculum_versions').select('id, status').eq('curriculum_id', curriculum.id).order('version', { ascending: false }).limit(1).maybeSingle(),
      'version lookup',
    ) ?? must<{ id: string; status: string }>(await admin.from('curriculum_versions').insert({ curriculum_id: curriculum.id, version: 1, status: 'draft' }).select().single(), 'version')
  return version
}

/** Objective codes → ids, inserting the missing ones while the version is still a draft. */
async function ensureObjectives(admin: SupabaseClient, version: { id: string; status: string }, lessons: ParsedLesson[]) {
  const existing = must<{ id: string; code: string }[]>(await admin.from('curriculum_objectives').select('id, code').eq('version_id', version.id), 'objectives')
  const byCode = new Map(existing.map((o) => [o.code, o.id]))
  const missing = lessons.flatMap((l) => l.parsed.meta.objectives).filter((o) => !byCode.has(o.id))
  if (missing.length && version.status !== 'draft')
    throw new Error(`version is ${version.status}; new objectives (${missing.map((o) => o.id).join(', ')}) need a new curriculum version`)
  if (missing.length) {
    const rows = must<{ id: string; code: string }[]>(
      await admin.from('curriculum_objectives').insert(missing.map((o) => ({ version_id: version.id, code: o.id, text: o.text, sort: byCode.size + missing.indexOf(o) }))).select('id, code'),
      'objectives insert',
    )
    rows.forEach((r) => byCode.set(r.code, r.id))
  }
  return byCode
}

async function ensureLesson(admin: SupabaseClient, version: { id: string; status: string }, sequence: number, l: ParsedLesson, objectiveIds: Map<string, string>) {
  const found = must<Row | null>(await admin.from('curriculum_lessons').select('id').eq('version_id', version.id).eq('sequence', sequence).maybeSingle(), 'lesson lookup')
  if (found) return found
  if (version.status !== 'draft') throw new Error(`version is ${version.status}; lesson ${sequence} "${l.title}" needs a new curriculum version`)
  return must<Row>(
    await admin
      .from('curriculum_lessons')
      .insert({
        version_id: version.id,
        sequence,
        title: l.title,
        estimated_minutes: l.parsed.meta.estimatedMinutes,
        status: 'ready',
        objective_ids: l.parsed.meta.objectives.map((o) => objectiveIds.get(o.id)),
        source_notes: l.sourceNotes,
      })
      .select()
      .single(),
    'lesson',
  )
}

/** Publishes a package revision for a lesson unless the same content is already published. Returns the published id. */
async function ensurePublishedPackage(admin: SupabaseClient, lessonId: string, l: ParsedLesson): Promise<string> {
  const content = l.parsed
  const material = { teacher_guide: l.teacherGuide, speaking_plan: l.speakingPlan }
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
    id = must<Row>(await admin.rpc('admin_new_revision', { package_id: published.id, content }), 'new revision').id
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
      id = must<Row>(await admin.from('lesson_content_packages').insert({ lesson_id: lessonId, status: 'draft', content, origin: 'manual', revision: 1 }).select().single(), 'package').id
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
  const open = must<Row | null>(
    await admin.from('program_assignments').select('id').eq('student_id', student.user_id).eq('curriculum_version_id', versionId).in('status', ['active', 'paused']).limit(1).maybeSingle(),
    'assignment lookup',
  )
  if (open) return console.log(`assign: ${code} already has this program, skipped`)
  must(await admin.rpc('admin_assign_program', { student_id: student.user_id, version_id: versionId, start_lesson_id: lessonId }), 'assign')
  console.log(`assign: ${code} assigned`)
}

export async function publishCurriculum(c: ContentCurriculum, assignCode?: string) {
  const lessons = validateCurriculum(c)
  const admin = await signIn()
  const version = await ensureVersion(admin, c)
  const objectiveIds = await ensureObjectives(admin, version, lessons)
  const lessonIds: string[] = []
  for (const [i, l] of lessons.entries()) {
    const lesson = await ensureLesson(admin, version, i + 1, l, objectiveIds)
    const packageId = await ensurePublishedPackage(admin, lesson.id, l)
    lessonIds.push(lesson.id)
    console.log(`lesson ${i + 1} "${l.title}": published package ${packageId}`)
  }
  if (version.status === 'draft') must(await admin.rpc('admin_publish_version', { version_id: version.id }), 'publish version')
  if (assignCode) await assign(admin, assignCode, version.id, lessonIds[0]!)
  console.log(`done: "${c.name}" version ${version.id}, ${lessons.length} lesson(s)`)
}

/** Shared entry point: `[--check] [--assign CODE]`. */
export function runCli(source: ContentCurriculum | (() => Promise<ContentCurriculum>)) {
  const args = process.argv.slice(2)
  const at = args.indexOf('--assign')
  const assignCode = at >= 0 ? args[at + 1] : undefined
  const run = async () => {
    if (at >= 0 && !assignCode) throw new Error('--assign needs a student code, e.g. --assign LUGU-1001')
    const c = typeof source === 'function' ? await source() : source
    if (args.includes('--check')) {
      const lessons = validateCurriculum(c)
      for (const l of lessons)
        console.log(
          `ok  ${l.title}: ${l.parsed.vocabulary.length} vocab, ${l.parsed.explanation.steps.length} steps, ${l.parsed.homework.groups.length} homework groups, ${l.parsed.assessment.quiz.length} quiz + ${l.parsed.assessment.reading.questions.length} reading`,
        )
      return
    }
    await publishCurriculum(c, assignCode)
  }
  run().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
}
