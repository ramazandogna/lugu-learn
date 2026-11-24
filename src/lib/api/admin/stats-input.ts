import type { DayKey, StatsInput } from '@/domain/stats'
import type { Tables } from '../../database.types'
import { db } from '../../supabase'
import { must } from './errors'

/** PostgREST returns at most 1000 rows per request; every read below pages until a short page. */
const PAGE = 1000
/** Max ids per `in (...)` filter, to keep request URLs short. */
const CHUNK = 80

type Page<T> = PromiseLike<{ data: T[] | null; error: unknown }>

/** Reads every row of a query by paging with `range`. The query must have a total, stable `order`. */
async function pageAll<T>(query: (from: number, to: number) => Page<T>): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    const rows = must(await query(from, from + PAGE - 1))
    out.push(...rows)
    if (rows.length < PAGE) return out
  }
}

/** `in (ids)` reads: splits ids into chunks and pages each one. */
async function pageIn<T>(ids: readonly string[], query: (chunk: string[], from: number, to: number) => Page<T>): Promise<T[]> {
  const unique = [...new Set(ids)]
  const parts: string[][] = []
  for (let i = 0; i < unique.length; i += CHUNK) parts.push(unique.slice(i, i + CHUNK))
  const rows = await Promise.all(parts.map((chunk) => pageAll((from, to) => query(chunk, from, to))))
  return rows.flat()
}

export interface StatsRange {
  from?: DayKey
  to?: DayKey
}

/** Istanbul is a fixed UTC+3 zone, so day keys map to exact instants. */
const startOf = (d: DayKey) => `${d}T00:00:00+03:00`
const endOf = (d: DayKey) => `${d}T23:59:59.999+03:00`

/**
 * Builds the complete `StatsInput` of one student. Reads are paged, so nothing is silently cut.
 * `range` (optional) limits dated activity rows (sessions, attempts, events, assessments,
 * completions, rewards, program events, breaks) and exams; without it everything is loaded.
 */
export async function studentStatsInput(studentId: string, range: StatsRange = {}): Promise<StatsInput> {
  const { from, to } = range
  const tsFilter = <Q extends { gte(c: string, v: string): Q; lte(c: string, v: string): Q }>(q: Q, col: string): Q => {
    let r = q
    if (from) r = r.gte(col, startOf(from))
    if (to) r = r.lte(col, endOf(to))
    return r
  }

  const [subjects, examRows, assignments, sessions, attempts, events, breaks, vocab, assessments, completions, rewards, speaking, tasks] = await Promise.all([
    pageAll((a, b) => db.from('school_subjects').select('*').order('id').range(a, b)),
    pageAll((a, b) => {
      let q = db.from('school_exams').select('*').eq('student_id', studentId)
      if (from) q = q.gte('exam_date', from)
      if (to) q = q.lte('exam_date', to)
      return q.order('id').range(a, b)
    }),
    pageAll((a, b) => db.from('program_assignments').select('*').eq('student_id', studentId).order('id').range(a, b)),
    pageAll((a, b) => tsFilter(db.from('learning_sessions').select('*').eq('student_id', studentId), 'started_at').order('id').range(a, b)),
    pageAll((a, b) => tsFilter(db.from('question_attempts').select('*').eq('student_id', studentId), 'created_at').order('id').range(a, b)),
    pageAll((a, b) => tsFilter(db.from('session_events').select('*').eq('student_id', studentId), 'at').order('id').range(a, b)),
    pageAll((a, b) => tsFilter(db.from('break_sessions').select('*').eq('student_id', studentId), 'started_at').order('id').range(a, b)),
    pageAll((a, b) => db.from('vocabulary_mastery').select('*').eq('student_id', studentId).order('package_id').order('item_id').range(a, b)),
    pageAll((a, b) => tsFilter(db.from('assessment_results').select('*').eq('student_id', studentId), 'submitted_at').order('id').range(a, b)),
    pageAll((a, b) => tsFilter(db.from('lesson_completion_records').select('*').eq('student_id', studentId), 'completed_at').order('id').range(a, b)),
    pageAll((a, b) => tsFilter(db.from('progress_rewards').select('*').eq('student_id', studentId), 'created_at').order('id').range(a, b)),
    pageAll((a, b) => db.from('speaking_sessions').select('*').eq('student_id', studentId).order('id').range(a, b)),
    pageAll((a, b) => db.from('student_tasks').select('*').eq('student_id', studentId).order('id').range(a, b)),
  ])

  const sessionIds = sessions.map((s) => s.id)
  const assignmentIds = assignments.map((a) => a.id)
  const examIds = examRows.map((e) => e.id)
  const speakingIds = speaking.map((s) => s.id)
  const packageIds = vocab.map((v) => v.package_id)
  const versionIds = assignments.map((a) => a.curriculum_version_id)

  const [results, sections, programEvents, notes, packages, versionLessons, sessionLessons] = await Promise.all([
    pageIn(examIds, (ids, a, b) => db.from('school_exam_results').select('*').in('exam_id', ids).order('id').range(a, b)),
    pageIn(sessionIds, (ids, a, b) => db.from('session_section_progress').select('*').in('session_id', ids).order('id').range(a, b)),
    pageIn(assignmentIds, (ids, a, b) => tsFilter(db.from('program_events').select('*').in('assignment_id', ids), 'created_at').order('id').range(a, b)),
    pageIn(speakingIds, (ids, a, b) => db.from('speaking_session_notes').select('*').in('speaking_session_id', ids).order('id').range(a, b)),
    pageIn(packageIds, (ids, a, b) => db.from('lesson_content_packages').select('id, lesson_id').in('id', ids).order('id').range(a, b)),
    pageIn(versionIds, (ids, a, b) => db.from('curriculum_lessons').select('*').in('version_id', ids).order('id').range(a, b)),
    pageIn(
      [...sessions.map((s) => s.lesson_id), ...completions.map((c) => c.lesson_id)],
      (ids, a, b) => db.from('curriculum_lessons').select('*').in('id', ids).order('id').range(a, b),
    ),
  ])
  const topicRows = await pageIn(
    results.map((r) => r.id),
    (ids, a, b) => db.from('school_exam_result_topics').select('*').in('result_id', ids).order('id').range(a, b),
  )

  const lessonMap = new Map<string, Tables<'curriculum_lessons'>>()
  for (const l of [...versionLessons, ...sessionLessons]) lessonMap.set(l.id, l)
  const lessonOfPackage = new Map(packages.map((p) => [p.id, p.lesson_id]))
  const lessonOfSession = new Map(sessions.map((s) => [s.id, s.lesson_id]))
  const resultKey = new Map(results.map((r) => [r.id, `${r.exam_id}:${r.subject_id}`]))
  const resultSubject = new Map(results.map((r) => [r.id, r.subject_id]))
  const validExam = new Set(examIds)

  return {
    subjects: subjects.map((s) => ({ id: s.id, name: s.name, sort: s.sort, active: s.active })),
    exams: examRows.map((e) => ({ examId: e.id, date: e.exam_date, kind: e.kind, createdAt: e.created_at })),
    results: results
      .filter((r) => validExam.has(r.exam_id))
      .map((r) => ({ examId: r.exam_id, subjectId: r.subject_id, total: r.total, correct: r.correct, incorrect: r.incorrect, blank: r.blank, net: r.net })),
    topics: topicRows.flatMap((t) => {
      const key = resultKey.get(t.result_id)
      const subjectId = resultSubject.get(t.result_id)
      return key && subjectId ? [{ resultKey: key, subjectId, topic: t.topic, correct: t.correct, incorrect: t.incorrect, blank: t.blank }] : []
    }),
    lessons: [...lessonMap.values()].map((l) => ({ id: l.id, sequence: l.sequence, title: l.title, status: l.status, versionId: l.version_id })),
    assignments: assignments.map((a) => ({ id: a.id, versionId: a.curriculum_version_id, status: a.status, createdAt: a.created_at })),
    programEvents: programEvents.map((e) => ({ assignmentId: e.assignment_id, kind: e.kind, createdAt: e.created_at })),
    sessions: sessions.map((s) => ({
      id: s.id,
      assignmentId: s.assignment_id,
      lessonId: s.lesson_id,
      kind: s.kind,
      status: s.status,
      activeSeconds: s.active_seconds,
      idleSeconds: s.idle_seconds,
      breakSeconds: s.break_seconds,
      startedAt: s.started_at,
      lastSeenAt: s.last_seen_at,
      completedAt: s.completed_at,
    })),
    sections: sections.map((x) => ({
      sessionId: x.session_id,
      section: x.section,
      status: x.status,
      attemptsCount: x.attempts_count,
      correctCount: x.correct_count,
      activeSeconds: x.active_seconds,
    })),
    attempts: attempts.map((a) => ({ sessionId: a.session_id, section: a.section, questionId: a.question_id, attemptNo: a.attempt_no, correct: a.correct, responseMs: a.response_ms, hintUsed: a.hint_used, at: a.created_at })),
    events: events.map((e) => ({ sessionId: e.session_id, at: e.at, kind: e.kind })),
    breaks: breaks.map((x) => ({ sessionId: x.session_id, startedAt: x.started_at, endedAt: x.ended_at, plannedMinutes: x.planned_minutes, earlyReturn: x.early_return })),
    vocab: vocab.map((v) => ({
      packageId: v.package_id,
      itemId: v.item_id,
      lessonId: lessonOfPackage.get(v.package_id) ?? null,
      correctCount: v.correct_count,
      incorrectCount: v.incorrect_count,
      createdAt: v.created_at,
      masteredAt: v.mastered_at,
      lastAttemptAt: v.last_attempt_at,
    })),
    assessments: assessments.flatMap((a) => {
      const lessonId = lessonOfSession.get(a.session_id)
      return lessonId ? [{ sessionId: a.session_id, lessonId, percent: a.percent, submittedAt: a.submitted_at }] : []
    }),
    completions: completions.map((c) => ({ lessonId: c.lesson_id, sessionId: c.session_id, completedAt: c.completed_at })),
    rewards: rewards.map((r) => ({ amount: r.amount, reason: r.reason, createdAt: r.created_at })),
    speaking: speaking.map((s) => ({ id: s.id, lessonId: s.lesson_id, status: s.status, plannedAt: s.planned_at, startedAt: s.started_at, endedAt: s.ended_at })),
    speakingNotes: notes.map((n) => ({ speakingSessionId: n.speaking_session_id, followUp: n.follow_up })),
    tasks: tasks.map((t) => ({ id: t.id, subjectId: t.subject_id, lessonId: t.lesson_id, status: t.status, dueDate: t.due_date, createdAt: t.created_at, completedAt: t.completed_at })),
  }
}

/** Light input for exam-only stats across all students (dashboard decline summary). */
export async function examStatsInputs(): Promise<{ studentId: string; input: StatsInput }[]> {
  const [subjects, exams] = await Promise.all([
    pageAll((a, b) => db.from('school_subjects').select('*').order('id').range(a, b)),
    pageAll((a, b) => db.from('school_exams').select('id, student_id, exam_date, kind, created_at').order('id').range(a, b)),
  ])
  const results = await pageIn(
    exams.map((e) => e.id),
    (ids, a, b) => db.from('school_exam_results').select('exam_id, subject_id, total, correct, incorrect, blank, net, id').in('exam_id', ids).order('id').range(a, b),
  )
  const byStudent = new Map<string, typeof exams>()
  for (const e of exams) byStudent.set(e.student_id, [...(byStudent.get(e.student_id) ?? []), e])
  const resultsByExam = new Map<string, typeof results>()
  for (const r of results) resultsByExam.set(r.exam_id, [...(resultsByExam.get(r.exam_id) ?? []), r])
  const subjectRows = subjects.map((s) => ({ id: s.id, name: s.name, sort: s.sort, active: s.active }))
  return [...byStudent.entries()].map(([studentId, list]) => ({
    studentId,
    input: {
      subjects: subjectRows,
      exams: list.map((e) => ({ examId: e.id, date: e.exam_date, kind: e.kind, createdAt: e.created_at })),
      results: list.flatMap((e) =>
        (resultsByExam.get(e.id) ?? []).map((r) => ({ examId: r.exam_id, subjectId: r.subject_id, total: r.total, correct: r.correct, incorrect: r.incorrect, blank: r.blank, net: r.net })),
      ),
      topics: [], lessons: [], assignments: [], programEvents: [], sessions: [], sections: [], attempts: [], events: [], breaks: [],
      vocab: [], assessments: [], completions: [], rewards: [], speaking: [], speakingNotes: [], tasks: [],
    },
  }))
}
