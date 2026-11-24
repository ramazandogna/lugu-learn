import type { Json, Tables, TablesInsert } from '../../database.types'
import { db } from '../../supabase'
import { must, ok } from './errors'

export type Subject = Tables<'school_subjects'>
export type Exam = Tables<'school_exams'>
export type ExamResult = Tables<'school_exam_results'>
export type AcademicInsightRow = Tables<'academic_insights'>

export async function listSubjects(): Promise<Subject[]> {
  return must(await db.from('school_subjects').select('*').order('sort').order('name'))
}

export interface SubjectInput {
  id?: string
  name: string
  sort: number
  active: boolean
  short_name?: string | null
  color?: string | null
}

export async function saveSubject(s: SubjectInput): Promise<Subject> {
  return must(
    await db.rpc('admin_upsert_subject', {
      p_subject_id: s.id ?? null,
      p_name: s.name,
      p_short_name: s.short_name ?? null,
      p_color: s.color ?? null,
      p_sort: s.sort,
      p_active: s.active,
    }),
  )
}

/** 'deleted' when no exam result uses it; 'archived' (set inactive) otherwise. */
export async function deleteSubject(id: string): Promise<'deleted' | 'archived'> {
  return must(await db.rpc('admin_remove_subject', { p_subject_id: id }))
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

/** The latest reviewed (teacher-approved) academic insight of a student, if any. */
export async function latestReviewedInsight(studentId: string): Promise<AcademicInsightRow | null> {
  const rows = must(
    await db
      .from('academic_insights')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'reviewed')
      .order('reviewed_at', { ascending: false })
      .limit(1),
  )
  return rows[0] ?? null
}

/** Stores an AI academic insight as reviewed; `reviewed_by` defaults to the signed-in admin. */
export async function saveReviewedInsight(studentId: string, content: Json, aiJobId: string | null): Promise<void> {
  ok(
    await db.from('academic_insights').insert({
      student_id: studentId,
      content,
      status: 'reviewed',
      ai_job_id: aiJobId,
      reviewed_at: new Date().toISOString(),
    }),
  )
}
