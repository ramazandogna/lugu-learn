import type { Json, PackageStatus, Tables } from '../../database.types'
import { db } from '../../supabase'
import { must, ok } from './errors'

export type PackageRow = Tables<'lesson_content_packages'>
export type AdminMaterialRow = Tables<'lesson_admin_material'>
export type AiJob = Tables<'ai_jobs'>

export async function lessonContext(lessonId: string) {
  const lesson = must(await db.from('curriculum_lessons').select('*').eq('id', lessonId).maybeSingle())
  const version = must(await db.from('curriculum_versions').select('*').eq('id', lesson.version_id).maybeSingle())
  const curriculum = must(await db.from('curricula').select('*').eq('id', version.curriculum_id).maybeSingle())
  return { lesson, version, curriculum }
}

export async function listPackages(lessonId: string): Promise<PackageRow[]> {
  return must(await db.from('lesson_content_packages').select('*').eq('lesson_id', lessonId).order('revision', { ascending: false }))
}

export async function adminMaterial(packageId: string): Promise<AdminMaterialRow | null> {
  const res = await db.from('lesson_admin_material').select('*').eq('package_id', packageId).maybeSingle()
  if (res.error) return must(res)
  return res.data
}

export async function setPackageStatus(packageId: string, status: PackageStatus): Promise<PackageRow> {
  return must(await db.rpc('admin_set_package_status', { package_id: packageId, status }))
}

/**
 * A draft is edited in place. Any other status is never rewritten: the edit
 * becomes a new draft revision, and the admin material is carried over.
 */
export async function saveContent(pkg: PackageRow, content: Json): Promise<PackageRow> {
  if (pkg.status === 'draft') return must(await db.from('lesson_content_packages').update({ content }).eq('id', pkg.id).select().single())
  return must(await db.rpc('admin_new_revision', { package_id: pkg.id, content }))
}

export async function saveAdminMaterial(packageId: string, patch: { teacher_guide?: Json; speaking_plan?: Json }): Promise<void> {
  ok(await db.from('lesson_admin_material').upsert({ package_id: packageId, ...patch }, { onConflict: 'package_id' }))
}

export async function getJob(id: string): Promise<AiJob> {
  return must(await db.from('ai_jobs').select('*').eq('id', id).maybeSingle())
}

export async function latestJob(filter: { lessonId?: string; studentId?: string; kind: AiJob['kind'] }): Promise<AiJob | null> {
  let q = db.from('ai_jobs').select('*').eq('kind', filter.kind)
  if (filter.lessonId) q = q.eq('lesson_id', filter.lessonId)
  if (filter.studentId) q = q.eq('student_id', filter.studentId)
  const rows = must(await q.order('created_at', { ascending: false }).limit(1))
  return rows[0] ?? null
}

/** The teacher guide of the student's current lesson: the published package, else the newest one. */
export async function lessonTeacherMaterial(lessonId: string): Promise<AdminMaterialRow | null> {
  const pkgs = await listPackages(lessonId)
  const pick = pkgs.find((p) => p.status === 'published') ?? pkgs[0]
  return pick ? adminMaterial(pick.id) : null
}

/** First manual revision of a lesson that has none (or a fresh start next to the existing ones). */
export async function createDraft(lessonId: string, content: Json): Promise<PackageRow> {
  const latest = must(await db.from('lesson_content_packages').select('revision').eq('lesson_id', lessonId).order('revision', { ascending: false }).limit(1))
  return must(
    await db
      .from('lesson_content_packages')
      .insert({ lesson_id: lessonId, revision: (latest[0]?.revision ?? 0) + 1, status: 'draft', origin: 'manual', content })
      .select()
      .single(),
  )
}
