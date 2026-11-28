import type { Tables } from '../../database.types'
import { db } from '../../supabase'
import { must } from './errors'

export interface LearningData {
  sessions: Tables<'learning_sessions'>[]
  sections: Tables<'session_section_progress'>[]
  attempts: Tables<'question_attempts'>[]
  breaks: Tables<'break_sessions'>[]
  events: Tables<'session_events'>[]
  mastery: Tables<'vocabulary_mastery'>[]
  assessments: Tables<'assessment_results'>[]
  completions: Tables<'lesson_completion_records'>[]
  /** Lesson id → title / sequence, for every lesson referenced above. */
  lessons: Map<string, { title: string; sequence: number; estimatedMinutes: number | null }>
  /** Package id → content (a `LessonPackage` document, unparsed). */
  packages: Map<string, { lessonId: string; revision: number; content: unknown }>
}

const LIMIT = 2000

async function enrich(base: Omit<LearningData, 'lessons' | 'packages'>): Promise<LearningData> {
  const lessonIds = [...new Set([...base.sessions.map((s) => s.lesson_id), ...base.completions.map((c) => c.lesson_id)])]
  const packageIds = [
    ...new Set([...base.sessions.map((s) => s.package_id), ...base.mastery.map((m) => m.package_id), ...base.attempts.map((a) => a.package_id)]),
  ]
  const [lessons, packages] = await Promise.all([
    lessonIds.length ? db.from('curriculum_lessons').select('id, title, sequence, estimated_minutes').in('id', lessonIds).then(must) : [],
    packageIds.length ? db.from('lesson_content_packages').select('id, lesson_id, revision, content').in('id', packageIds).then(must) : [],
  ])
  return {
    ...base,
    lessons: new Map(lessons.map((l) => [l.id, { title: l.title, sequence: l.sequence, estimatedMinutes: l.estimated_minutes ?? null }])),
    packages: new Map(packages.map((p) => [p.id, { lessonId: p.lesson_id, revision: p.revision, content: p.content }])),
  }
}

export async function studentLearning(studentId: string): Promise<LearningData> {
  const sessions = must(
    await db.from('learning_sessions').select('*').eq('student_id', studentId).order('started_at', { ascending: false }).limit(300),
  )
  const sessionIds = sessions.map((s) => s.id)
  const [sections, attempts, breaks, events, mastery, assessments, completions] = await Promise.all([
    sessionIds.length ? db.from('session_section_progress').select('*').in('session_id', sessionIds).then(must) : [],
    db.from('question_attempts').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(LIMIT).then(must),
    db.from('break_sessions').select('*').eq('student_id', studentId).order('started_at', { ascending: false }).limit(500).then(must),
    db.from('session_events').select('*').eq('student_id', studentId).order('at', { ascending: false }).limit(LIMIT).then(must),
    db.from('vocabulary_mastery').select('*').eq('student_id', studentId).then(must),
    db.from('assessment_results').select('*').eq('student_id', studentId).order('submitted_at', { ascending: false }).then(must),
    db.from('lesson_completion_records').select('*').eq('student_id', studentId).order('completed_at', { ascending: false }).then(must),
  ])
  return enrich({ sessions, sections, attempts, breaks, events, mastery, assessments, completions })
}

/** Everything recorded against one lesson, across students (for lesson analytics). */
export async function lessonLearning(lessonId: string): Promise<LearningData> {
  const sessions = must(
    await db.from('learning_sessions').select('*').eq('lesson_id', lessonId).order('started_at', { ascending: false }).limit(500),
  )
  const sessionIds = sessions.map((s) => s.id)
  const packageIds = [...new Set(sessions.map((s) => s.package_id))]
  const [sections, attempts, mastery, assessments, completions] = await Promise.all([
    sessionIds.length ? db.from('session_section_progress').select('*').in('session_id', sessionIds).then(must) : [],
    sessionIds.length ? db.from('question_attempts').select('*').in('session_id', sessionIds).limit(LIMIT * 2).then(must) : [],
    packageIds.length ? db.from('vocabulary_mastery').select('*').in('package_id', packageIds).then(must) : [],
    sessionIds.length ? db.from('assessment_results').select('*').in('session_id', sessionIds).then(must) : [],
    db.from('lesson_completion_records').select('*').eq('lesson_id', lessonId).then(must),
  ])
  return enrich({ sessions, sections, attempts, breaks: [], events: [], mastery, assessments, completions })
}

export interface RecentActivity {
  sessions: Tables<'learning_sessions'>[]
  completions: Tables<'lesson_completion_records'>[]
  assessments: Tables<'assessment_results'>[]
  attempts: Pick<Tables<'question_attempts'>, 'student_id' | 'question_id' | 'section' | 'attempt_no' | 'correct' | 'response_ms' | 'hint_used' | 'created_at'>[]
  mastery: Tables<'vocabulary_mastery'>[]
  lessons: Map<string, { title: string; sequence: number }>
}

/** Cross-student activity since `sinceIso`, for the dashboard. */
export async function recentActivity(sinceIso: string): Promise<RecentActivity> {
  const [sessions, completions, assessments, attempts, mastery] = await Promise.all([
    db.from('learning_sessions').select('*').gte('last_seen_at', sinceIso).order('last_seen_at', { ascending: false }).limit(1000).then(must),
    db.from('lesson_completion_records').select('*').gte('completed_at', sinceIso).order('completed_at', { ascending: false }).then(must),
    db.from('assessment_results').select('*').gte('submitted_at', sinceIso).order('submitted_at', { ascending: false }).then(must),
    db
      .from('question_attempts')
      .select('student_id, question_id, section, attempt_no, correct, response_ms, hint_used, created_at')
      .gte('created_at', sinceIso)
      .limit(5000)
      .then(must),
    db.from('vocabulary_mastery').select('*').gte('updated_at', sinceIso).then(must),
  ])
  const lessonIds = [...new Set([...sessions.map((s) => s.lesson_id), ...completions.map((c) => c.lesson_id)])]
  const lessons = lessonIds.length ? must(await db.from('curriculum_lessons').select('id, title, sequence').in('id', lessonIds)) : []
  return {
    sessions,
    completions,
    assessments,
    attempts,
    mastery,
    lessons: new Map(lessons.map((l) => [l.id, { title: l.title, sequence: l.sequence }])),
  }
}
