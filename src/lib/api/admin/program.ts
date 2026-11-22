import type { ProgressAction, Tables } from '../../database.types'
import { db } from '../../supabase'
import { must } from './errors'

export type LessonRow = Tables<'curriculum_lessons'>

export interface AssignmentDetail {
  assignment: Tables<'program_assignments'>
  curriculumName: string
  version: number
  lessons: LessonRow[]
  completedLessonIds: Set<string>
  events: Tables<'program_events'>[]
}

export interface PublishedVersion {
  id: string
  version: number
  curriculumName: string
  lessons: LessonRow[]
}

export async function listAssignments(studentId: string): Promise<AssignmentDetail[]> {
  const assignments = must(
    await db.from('program_assignments').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
  )
  if (!assignments.length) return []
  const versionIds = [...new Set(assignments.map((a) => a.curriculum_version_id))]
  const ids = assignments.map((a) => a.id)
  const [versions, lessons, events, completions] = await Promise.all([
    db.from('curriculum_versions').select('id, version, curriculum_id').in('id', versionIds).then(must),
    db.from('curriculum_lessons').select('*').in('version_id', versionIds).order('sequence').then(must),
    db.from('program_events').select('*').in('assignment_id', ids).order('created_at', { ascending: false }).then(must),
    db.from('lesson_completion_records').select('assignment_id, lesson_id').in('assignment_id', ids).then(must),
  ])
  const curricula = must(
    await db
      .from('curricula')
      .select('id, name')
      .in('id', [...new Set(versions.map((v) => v.curriculum_id))]),
  )
  return assignments.map((a) => {
    const v = versions.find((x) => x.id === a.curriculum_version_id)
    return {
      assignment: a,
      curriculumName: curricula.find((c) => c.id === v?.curriculum_id)?.name ?? '—',
      version: v?.version ?? 0,
      lessons: lessons.filter((l) => l.version_id === a.curriculum_version_id),
      completedLessonIds: new Set(completions.filter((c) => c.assignment_id === a.id).map((c) => c.lesson_id)),
      events: events.filter((e) => e.assignment_id === a.id),
    }
  })
}

export async function listPublishedVersions(): Promise<PublishedVersion[]> {
  const versions = must(await db.from('curriculum_versions').select('*').eq('status', 'published').order('created_at', { ascending: false }))
  if (!versions.length) return []
  const [curricula, lessons] = await Promise.all([
    db
      .from('curricula')
      .select('id, name')
      .in('id', [...new Set(versions.map((v) => v.curriculum_id))])
      .then(must),
    db
      .from('curriculum_lessons')
      .select('*')
      .in(
        'version_id',
        versions.map((v) => v.id),
      )
      .neq('status', 'archived')
      .order('sequence')
      .then(must),
  ])
  return versions.map((v) => ({
    id: v.id,
    version: v.version,
    curriculumName: curricula.find((c) => c.id === v.curriculum_id)?.name ?? '—',
    lessons: lessons.filter((l) => l.version_id === v.id),
  }))
}

export async function assignProgram(studentId: string, versionId: string, startLessonId: string | null) {
  return must(await db.rpc('admin_assign_program', { student_id: studentId, version_id: versionId, start_lesson_id: startLessonId }))
}

export async function setProgress(assignmentId: string, action: ProgressAction, note: string, lessonId?: string | null) {
  return must(
    await db.rpc('admin_set_progress', { assignment_id: assignmentId, action, lesson_id: lessonId ?? null, note: note.trim() || null }),
  )
}
