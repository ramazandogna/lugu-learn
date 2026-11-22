import type { Json, Tables, TablesInsert } from '../../database.types'
import { db } from '../../supabase'
import { must, ok } from './errors'

export type Setting = Tables<'system_settings'>
export type School = Tables<'schools'>
export type Achievement = Tables<'achievements'>
export type DeletionRequest = Tables<'data_deletion_requests'>

export async function listSettings(): Promise<Setting[]> {
  return must(await db.from('system_settings').select('*').order('key'))
}

export async function saveSetting(key: string, value: Json, description?: string | null): Promise<void> {
  ok(await db.from('system_settings').upsert({ key, value, ...(description !== undefined ? { description } : {}) }, { onConflict: 'key' }))
}

/** `academic.wrong_penalty` (default 0.25). */
export async function wrongPenalty(): Promise<number> {
  const res = await db.from('system_settings').select('value').eq('key', 'academic.wrong_penalty').maybeSingle()
  if (res.error) return must(res)
  return typeof res.data?.value === 'number' ? res.data.value : 0.25
}

export async function listSchools(q: string): Promise<School[]> {
  let query = db.from('schools').select('*').is('merged_into_id', null)
  const term = q.trim()
  if (term) query = query.or(`name.ilike.%${term.replace(/[%,()]/g, ' ')}%,city.ilike.%${term.replace(/[%,()]/g, ' ')}%`)
  return must(await query.order('name').limit(200))
}

export async function updateSchool(id: string, patch: Pick<School, 'name' | 'city' | 'district' | 'country'>): Promise<void> {
  ok(await db.from('schools').update(patch).eq('id', id))
}

export async function mergeSchools(fromId: string, intoId: string): Promise<School> {
  return must(await db.rpc('admin_merge_schools', { from_id: fromId, into_id: intoId }))
}

export async function listAchievements(): Promise<Achievement[]> {
  return must(await db.from('achievements').select('*').order('kind').order('threshold'))
}

export type AchievementInput = Pick<TablesInsert<'achievements'>, 'key' | 'title' | 'description' | 'kind' | 'threshold' | 'xp' | 'active' | 'icon'>

export async function saveAchievement(id: string | null, input: AchievementInput): Promise<void> {
  if (id) ok(await db.from('achievements').update(input).eq('id', id))
  else ok(await db.from('achievements').insert(input))
}

export async function listDeletionRequests(): Promise<DeletionRequest[]> {
  return must(await db.from('data_deletion_requests').select('*').order('created_at', { ascending: false }))
}

export async function createDeletionRequest(studentId: string, studentCode: string, reason: string): Promise<void> {
  ok(await db.from('data_deletion_requests').insert({ student_id: studentId, student_code: studentCode, reason: reason.trim() || null }))
}

export async function rejectDeletionRequest(id: string): Promise<void> {
  ok(await db.from('data_deletion_requests').update({ status: 'rejected' }).eq('id', id))
}
