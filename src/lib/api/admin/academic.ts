import type { Tables, TablesInsert } from '../../database.types'
import { db } from '../../supabase'
import { must, ok } from './errors'

export type Subject = Tables<'school_subjects'>
export type Exam = Tables<'school_exams'>
export type ExamResult = Tables<'school_exam_results'>

export async function listSubjects(): Promise<Subject[]> {
  return must(await db.from('school_subjects').select('*').order('sort').order('name'))
}

export async function saveSubject(s: { id?: string; name: string; sort: number; active: boolean }): Promise<void> {
  if (s.id) ok(await db.from('school_subjects').update({ name: s.name, sort: s.sort, active: s.active }).eq('id', s.id))
  else ok(await db.from('school_subjects').insert({ name: s.name, sort: s.sort, active: s.active }))
}

export async function deleteSubject(id: string): Promise<void> {
  ok(await db.from('school_subjects').delete().eq('id', id))
}

export async function studentExams(studentId: string): Promise<{ exams: Exam[]; results: ExamResult[] }> {
  const exams = must(await db.from('school_exams').select('*').eq('student_id', studentId).order('exam_date', { ascending: false }))
  const results = exams.length
    ? must(
        await db
          .from('school_exam_results')
          .select('*')
          .in(
            'exam_id',
            exams.map((e) => e.id),
          ),
      )
    : []
  return { exams, results }
}

export type ExamInput = Pick<TablesInsert<'school_exams'>, 'title' | 'exam_date' | 'kind' | 'notes'>
export type ResultInput = { subject_id: string; total: number | null; correct: number; incorrect: number; blank: number }

/** Saves an exam with its per-subject results; `net` is computed by the database. */
export async function saveExam(studentId: string, exam: ExamInput & { id?: string }, results: readonly ResultInput[]): Promise<void> {
  const { id, ...fields } = exam
  const saved = id
    ? must(await db.from('school_exams').update(fields).eq('id', id).select().single())
    : must(await db.from('school_exams').insert({ ...fields, student_id: studentId }).select().single())
  ok(await db.from('school_exam_results').delete().eq('exam_id', saved.id))
  if (results.length) ok(await db.from('school_exam_results').insert(results.map((r) => ({ ...r, exam_id: saved.id }))))
}

export async function deleteExam(id: string): Promise<void> {
  ok(await db.from('school_exams').delete().eq('id', id))
}

/** Newest exams across students with their results, for the dashboard. */
export async function recentExams(limit = 10): Promise<{ exams: Exam[]; results: ExamResult[] }> {
  const exams = must(await db.from('school_exams').select('*').order('exam_date', { ascending: false }).limit(limit))
  const results = exams.length
    ? must(
        await db
          .from('school_exam_results')
          .select('*')
          .in(
            'exam_id',
            exams.map((e) => e.id),
          ),
      )
    : []
  return { exams, results }
}
