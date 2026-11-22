/**
 * The student client's only door to Supabase. Views and composables import
 * from here; nothing else under features/student or features/auth touches
 * `db`. Every call resolves to data or throws an `ApiError`.
 */
import type {
  BreakMinutes,
  Json,
  SectionKey,
  SessionEventKind,
  SessionKind,
  Tables,
  VocabDirection,
} from '@/lib/database.types'
import { db } from '@/lib/supabase'

import { ApiError, toApiError } from './errors'

export { ApiError, friendlyMessage, toApiError } from './errors'
export { createWriteQueue } from './write-queue'
export type { QueueStatus, WriteQueue } from './write-queue'

async function unwrap<R extends { data: unknown; error: unknown }>(p: PromiseLike<R>): Promise<NonNullable<R['data']>> {
  let res: R
  try {
    res = await p
  } catch (e) {
    throw toApiError(e)
  }
  if (res.error) throw toApiError(res.error)
  if (res.data === null || res.data === undefined) throw new ApiError('UNKNOWN', 'empty response')
  return res.data as NonNullable<R['data']>
}

/** For RPCs that return nothing. */
async function run(p: PromiseLike<{ error: unknown }>): Promise<void> {
  let res: { error: unknown }
  try {
    res = await p
  } catch (e) {
    throw toApiError(e)
  }
  if (res.error) throw toApiError(res.error)
}

/* ── home, map, content ─────────────────────────────────────────────── */

export const getHome = () => unwrap(db.rpc('student_home'))
export const getLearningMap = (assignmentId: string) => unwrap(db.rpc('student_learning_map', { assignment_id: assignmentId }))
export const getLessonContent = (lessonId: string) => unwrap(db.rpc('student_lesson_content', { lesson_id: lessonId }))

/** Vocabulary ids of this package the learner has already mastered (primary sessions). */
export async function getMasteredItems(packageId: string): Promise<string[]> {
  const rows = await unwrap(db.from('vocabulary_mastery').select('item_id, mastered_at').eq('package_id', packageId))
  return rows.filter((r) => r.mastered_at !== null).map((r) => r.item_id)
}

/* ── session ────────────────────────────────────────────────────────── */

export const startOrResumeSession = (lessonId: string, kind: SessionKind) =>
  unwrap(db.rpc('start_or_resume_session', { lesson_id: lessonId, kind }))

export const saveSectionState = (sessionId: string, section: SectionKey, state: Json, activeSecondsDelta = 0) =>
  run(db.rpc('save_section_state', { session_id: sessionId, section, state, active_seconds_delta: Math.max(0, Math.min(600, Math.round(activeSecondsDelta))) }))

export const completeSection = (sessionId: string, section: SectionKey) => unwrap(db.rpc('complete_section', { session_id: sessionId, section }))

export const recordAnswer = (args: { sessionId: string; section: SectionKey; questionId: string; response: Json; responseMs: number; hintUsed: boolean }) =>
  unwrap(
    db.rpc('record_answer', {
      session_id: args.sessionId,
      section: args.section,
      question_id: args.questionId,
      response: args.response,
      response_ms: Math.round(args.responseMs),
      hint_used: args.hintUsed,
    }),
  )

export const recordVocabAnswer = (args: { sessionId: string; itemId: string; direction: VocabDirection; chosen: string; responseMs: number }) =>
  unwrap(
    db.rpc('record_vocab_answer', {
      session_id: args.sessionId,
      item_id: args.itemId,
      direction: args.direction,
      chosen: args.chosen,
      response_ms: Math.round(args.responseMs),
    }),
  )

export const submitAssessment = (sessionId: string, answers: Record<string, number | string | string[]>) =>
  unwrap(db.rpc('submit_assessment', { session_id: sessionId, answers }))

export const recordSessionEvent = (sessionId: string, kind: SessionEventKind, data: Json = {}) =>
  run(db.rpc('record_session_event', { session_id: sessionId, kind, data }))

export const startBreak = (sessionId: string, afterSection: SectionKey, minutes: BreakMinutes) =>
  unwrap(db.rpc('start_break', { session_id: sessionId, after_section: afterSection, planned_minutes: minutes }))

export const endBreak = (breakId: string) => unwrap(db.rpc('end_break', { break_id: breakId }))

export const completeLesson = (sessionId: string) => unwrap(db.rpc('complete_lesson', { session_id: sessionId }))

/* ── profile & schools ──────────────────────────────────────────────── */

export type School = Tables<'schools'>

export async function getMyProfile(userId: string) {
  const row = await unwrap(
    db
      .from('student_profiles')
      .select('first_name, last_name, display_name, grade, avatar_key, school_id, student_code, profile_completed_at')
      .eq('user_id', userId)
      .maybeSingle(),
  )
  const school = row.school_id ? await unwrap(db.from('schools').select('id, name, city').eq('id', row.school_id).maybeSingle()).catch(() => null) : null
  return { ...row, school }
}

export const searchSchools = (q: string) => unwrap(db.rpc('search_schools', { q }))

export const addSchool = (name: string, city: string, district: string | null) =>
  unwrap(db.rpc('add_school', { name, city, district }))

export const updateMyProfile = (p: {
  firstName?: string | null
  lastName?: string | null
  displayName?: string | null
  grade?: number | null
  schoolId?: string | null
  avatarKey?: string | null
}) =>
  unwrap(
    db.rpc('update_my_profile', {
      first_name: p.firstName ?? null,
      last_name: p.lastName ?? null,
      display_name: p.displayName ?? null,
      grade: p.grade ?? null,
      school_id: p.schoolId ?? null,
      avatar_key: p.avatarKey ?? null,
    }),
  )

/* ── achievements & history ─────────────────────────────────────────── */

export async function getAchievements() {
  const [all, mine, rewards] = await Promise.all([
    unwrap(db.from('achievements').select('id, key, title, description, icon, kind, threshold, xp').eq('active', true).order('threshold', { ascending: true, nullsFirst: false })),
    unwrap(db.from('student_achievement_records').select('achievement_id, awarded_at')),
    unwrap(db.from('progress_rewards').select('id, amount, reason, created_at, lesson_id, note').order('created_at', { ascending: false }).limit(50)),
  ])
  const earned = new Map(mine.map((r) => [r.achievement_id, r.awarded_at]))
  return {
    achievements: all.map((a) => ({ ...a, awardedAt: earned.get(a.id) ?? null })),
    rewards,
  }
}

export async function getHistory() {
  const [sessions, completions, breaks] = await Promise.all([
    unwrap(
      db
        .from('learning_sessions')
        .select('id, kind, status, started_at, completed_at, active_seconds, break_seconds, lesson_id, curriculum_lessons(title, sequence)')
        .order('started_at', { ascending: false })
        .limit(100),
    ),
    unwrap(db.from('lesson_completion_records').select('id, lesson_id, session_id, completed_at').order('completed_at', { ascending: false })),
    unwrap(db.from('break_sessions').select('id, session_id, planned_minutes, started_at, ended_at, early_return').order('started_at', { ascending: false }).limit(200)),
  ])
  return { sessions, completions, breaks }
}

/** Breaks of a session left open (the page was closed mid-break). */
export async function getOpenBreaks(sessionId: string): Promise<string[]> {
  const rows = await unwrap(db.from('break_sessions').select('id').eq('session_id', sessionId).is('ended_at', null))
  return rows.map((r) => r.id)
}
