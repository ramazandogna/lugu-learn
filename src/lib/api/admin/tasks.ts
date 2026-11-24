import type { Tables, TaskStatus } from '../../database.types'
import { db } from '../../supabase'
import { must, ok } from './errors'

export type StudentTaskRow = Tables<'student_tasks'>

export interface TaskInput {
  title: string
  description?: string | null
  dueDate?: string | null
  subjectId?: string | null
  lessonId?: string | null
}

export async function listTasks(studentId: string): Promise<StudentTaskRow[]> {
  return must(await db.from('student_tasks').select('*').eq('student_id', studentId).order('due_date', { ascending: true, nullsFirst: false }).order('created_at'))
}

export async function assignTask(studentId: string, t: TaskInput): Promise<StudentTaskRow> {
  return must(
    await db.rpc('admin_assign_task', {
      p_student_id: studentId,
      p_title: t.title,
      p_description: t.description ?? null,
      p_due_date: t.dueDate ?? null,
      p_subject_id: t.subjectId ?? null,
      p_lesson_id: t.lessonId ?? null,
    }),
  )
}

/**
 * Omitted/undefined field = unchanged (the RPC treats null as "keep").
 * A description is cleared by passing '' (stored as empty). due date, subject and lesson cannot be
 * cleared through the RPC (coalesce); use status 'cancelled' or delete + reassign instead.
 */
export async function updateTask(taskId: string, t: Partial<TaskInput> & { status?: TaskStatus }): Promise<StudentTaskRow> {
  return must(
    await db.rpc('admin_update_task', {
      p_task_id: taskId,
      p_title: t.title ?? null,
      p_description: t.description ?? null,
      p_due_date: t.dueDate ?? null,
      p_subject_id: t.subjectId ?? null,
      p_lesson_id: t.lessonId ?? null,
      p_status: t.status ?? null,
    }),
  )
}

export async function deleteTask(taskId: string): Promise<void> {
  ok(await db.rpc('admin_delete_task', { p_task_id: taskId }))
}

/** Lessons of the programs assigned to a student (for linking a task to a lesson). */
export async function studentProgramLessons(studentId: string): Promise<{ id: string; sequence: number; title: string }[]> {
  const assignments = must(await db.from('program_assignments').select('curriculum_version_id').eq('student_id', studentId))
  const versionIds = [...new Set(assignments.map((a) => a.curriculum_version_id))]
  if (!versionIds.length) return []
  const rows = must(await db.from('curriculum_lessons').select('id, sequence, title').in('version_id', versionIds).neq('status', 'archived').order('sequence'))
  return rows
}
