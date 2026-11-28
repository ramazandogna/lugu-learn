import { db } from '@/lib/supabase'
import { must } from '@/lib/api/admin/errors'
import type { CurriculumLesson, CurriculumVersion } from '@/lib/api/admin'

/** The version the admin reads: highest published one, else the newest. */
export function pickVersion<T extends Pick<CurriculumVersion, 'status' | 'version'>>(versions: readonly T[]): T | undefined {
  const published = versions.filter((v) => v.status === 'published').sort((a, b) => b.version - a.version)
  return published[0] ?? [...versions].sort((a, b) => b.version - a.version)[0]
}

export interface CurriculumSummary {
  id: string
  name: string
  description: string | null
  version: number | null
  publishedVersionId: string | null
  lessonCount: number
}

export async function listCurriculumSummaries(): Promise<CurriculumSummary[]> {
  const [curricula, versions] = await Promise.all([
    db.from('curricula').select('id, name, description, created_at').order('created_at', { ascending: false }).then(must),
    db.from('curriculum_versions').select('id, curriculum_id, version, status').then(must),
  ])
  const picked = curricula.map((c) => ({ c, v: pickVersion(versions.filter((x) => x.curriculum_id === c.id)) }))
  const ids = picked.flatMap((p) => (p.v ? [p.v.id] : []))
  const lessons = ids.length ? await db.from('curriculum_lessons').select('id, version_id').in('version_id', ids).neq('status', 'archived').then(must) : []
  return picked.map(({ c, v }) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    version: v?.version ?? null,
    publishedVersionId: v?.status === 'published' ? v.id : null,
    lessonCount: v ? lessons.filter((l) => l.version_id === v.id).length : 0,
  }))
}

export interface LessonRow {
  lesson: CurriculumLesson
  published: boolean
}

export async function listLessonRows(versionId: string): Promise<LessonRow[]> {
  const lessons = await db.from('curriculum_lessons').select('*').eq('version_id', versionId).neq('status', 'archived').order('sequence').then(must)
  if (!lessons.length) return []
  const pkgs = await db.from('lesson_content_packages').select('lesson_id, status').in('lesson_id', lessons.map((l) => l.id)).eq('status', 'published').then(must)
  const live = new Set(pkgs.map((p) => p.lesson_id))
  return lessons.map((lesson) => ({ lesson, published: live.has(lesson.id) }))
}
