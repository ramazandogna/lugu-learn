import type { Tables, TablesUpdate } from '../../database.types'
import { db } from '../../supabase'
import { must, ok } from './errors'

export type SpeakingSession = Tables<'speaking_sessions'>
export type SpeakingNote = Tables<'speaking_session_notes'>
export type LearningProfileRow = Tables<'student_learning_profiles'>

export async function listSpeakingSessions(filter: { studentId?: string; from?: string } = {}): Promise<SpeakingSession[]> {
  let q = db.from('speaking_sessions').select('*')
  if (filter.studentId) q = q.eq('student_id', filter.studentId)
  if (filter.from) q = q.gte('planned_at', filter.from)
  return must(await q.order('planned_at', { ascending: false, nullsFirst: false }).limit(300))
}

export async function scheduleSpeaking(studentId: string, plannedAt: string, lessonId: string | null): Promise<SpeakingSession> {
  return must(
    await db.from('speaking_sessions').insert({ student_id: studentId, planned_at: plannedAt, lesson_id: lessonId, status: 'planned' }).select().single(),
  )
}

export async function getSpeakingSession(id: string) {
  const session = must(await db.from('speaking_sessions').select('*').eq('id', id).maybeSingle())
  const notes = must(await db.from('speaking_session_notes').select('*').eq('speaking_session_id', id).order('created_at'))
  return { session, note: notes.at(-1) ?? null }
}

export async function updateSpeakingSession(id: string, patch: TablesUpdate<'speaking_sessions'>): Promise<SpeakingSession> {
  return must(await db.from('speaking_sessions').update(patch).eq('id', id).select().single())
}

export type NoteFields = Pick<SpeakingNote, 'observations' | 'strengths' | 'goals' | 'follow_up'>

export async function saveSpeakingNote(sessionId: string, noteId: string | null, fields: NoteFields): Promise<SpeakingNote> {
  if (noteId) return must(await db.from('speaking_session_notes').update(fields).eq('id', noteId).select().single())
  return must(await db.from('speaking_session_notes').insert({ ...fields, speaking_session_id: sessionId }).select().single())
}

export async function speakingNotesFor(sessionIds: readonly string[]): Promise<SpeakingNote[]> {
  if (!sessionIds.length) return []
  return must(await db.from('speaking_session_notes').select('*').in('speaking_session_id', [...sessionIds]).order('created_at'))
}

export async function learningProfile(studentId: string): Promise<LearningProfileRow | null> {
  const res = await db.from('student_learning_profiles').select('*').eq('student_id', studentId).maybeSingle()
  if (res.error) return must(res)
  return res.data
}

/** Teacher-owned text; the AI job never writes it. */
export async function saveTeacherObservations(studentId: string, text: string): Promise<void> {
  ok(
    await db
      .from('student_learning_profiles')
      .upsert({ student_id: studentId, teacher_observations: text.trim() || null }, { onConflict: 'student_id' }),
  )
}
