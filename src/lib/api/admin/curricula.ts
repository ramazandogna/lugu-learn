import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'
import { db, supabase } from '../../supabase'
import { AdminApiError, must, ok, toAdminError } from './errors'

export type Curriculum = Tables<'curricula'>
export type CurriculumVersion = Tables<'curriculum_versions'>
export type CurriculumLesson = Tables<'curriculum_lessons'>
export type CurriculumObjective = Tables<'curriculum_objectives'>
export type CurriculumSource = Tables<'curriculum_sources'>

export interface CurriculumListItem extends Curriculum {
  versionCount: number
  publishedVersion: number | null
}

export async function listCurricula(): Promise<CurriculumListItem[]> {
  const [curricula, versions] = await Promise.all([
    db.from('curricula').select('*').order('created_at', { ascending: false }).then(must),
    db.from('curriculum_versions').select('curriculum_id, version, status').then(must),
  ])
  return curricula.map((c) => {
    const vs = versions.filter((v) => v.curriculum_id === c.id)
    const published = vs.filter((v) => v.status === 'published').map((v) => v.version)
    return { ...c, versionCount: vs.length, publishedVersion: published.length ? Math.max(...published) : null }
  })
}

export type CurriculumInput = Pick<TablesInsert<'curricula'>, 'name' | 'description' | 'grade' | 'target_level' | 'kind'>

/** Creates the curriculum and its first draft version. */
export async function createCurriculum(input: CurriculumInput): Promise<Curriculum> {
  const c = must(await db.from('curricula').insert(input).select().single())
  ok(await db.from('curriculum_versions').insert({ curriculum_id: c.id, version: 1 }))
  return c
}

export async function updateCurriculum(id: string, patch: TablesUpdate<'curricula'>): Promise<void> {
  ok(await db.from('curricula').update(patch).eq('id', id))
}

export async function deleteCurriculum(id: string): Promise<void> {
  ok(await db.from('curricula').delete().eq('id', id))
}

export async function getCurriculum(id: string) {
  const [curriculum, versions] = await Promise.all([
    db.from('curricula').select('*').eq('id', id).maybeSingle().then(must),
    db.from('curriculum_versions').select('*').eq('curriculum_id', id).order('version', { ascending: false }).then(must),
  ])
  return { curriculum, versions }
}

export async function newVersion(curriculumId: string) {
  return must(await db.rpc('admin_new_version', { curriculum_id: curriculumId }))
}

export async function publishVersion(versionId: string) {
  return must(await db.rpc('admin_publish_version', { version_id: versionId }))
}

export async function versionContents(versionId: string) {
  const [lessons, objectives, sources] = await Promise.all([
    db.from('curriculum_lessons').select('*').eq('version_id', versionId).order('sequence').then(must),
    db.from('curriculum_objectives').select('*').eq('version_id', versionId).order('sort').then(must),
    db.from('curriculum_sources').select('*').eq('version_id', versionId).order('created_at', { ascending: false }).then(must),
  ])
  return { lessons, objectives, sources }
}

export type LessonInput = Pick<
  TablesInsert<'curriculum_lessons'>,
  'title' | 'estimated_minutes' | 'objective_ids' | 'prerequisite_ids' | 'source_notes' | 'status'
>

export async function createLesson(versionId: string, sequence: number, input: LessonInput) {
  return must(await db.from('curriculum_lessons').insert({ ...input, version_id: versionId, sequence }).select().single())
}

export async function updateLesson(id: string, patch: TablesUpdate<'curriculum_lessons'>): Promise<void> {
  ok(await db.from('curriculum_lessons').update(patch).eq('id', id))
}

export async function deleteLesson(id: string): Promise<void> {
  ok(await db.from('curriculum_lessons').delete().eq('id', id))
}

/** Writes a new order in one transaction (`admin_reorder_lessons`); `orderedIds` = every lesson of the version. */
export async function reorderLessons(orderedIds: readonly string[], _currentMax?: number): Promise<void> {
  const first = orderedIds[0]
  if (!first) return
  const lesson = must(await db.from('curriculum_lessons').select('version_id').eq('id', first).single())
  ok(await db.rpc('admin_reorder_lessons', { version_id: lesson.version_id, lesson_ids: [...orderedIds] }))
}

export async function upsertObjective(versionId: string, o: { id?: string; code: string; text: string; sort: number }) {
  if (o.id) ok(await db.from('curriculum_objectives').update({ code: o.code, text: o.text, sort: o.sort }).eq('id', o.id))
  else ok(await db.from('curriculum_objectives').insert({ version_id: versionId, code: o.code, text: o.text, sort: o.sort }))
}

export async function deleteObjective(id: string): Promise<void> {
  ok(await db.from('curriculum_objectives').delete().eq('id', id))
}

const BUCKET = 'curriculum-sources'

export function sourceKind(file: File): 'pdf' | 'image' | 'text' | null {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('text/')) return 'text'
  return null
}

export interface SourceTarget {
  curriculumId: string
  versionId: string
  lessonId: string | null
}

export async function addTextSource(target: SourceTarget, title: string, text: string): Promise<void> {
  ok(
    await db.from('curriculum_sources').insert({
      curriculum_id: target.curriculumId,
      version_id: target.versionId,
      lesson_id: target.lessonId,
      kind: 'text',
      title,
      text_content: text,
    }),
  )
}

export async function uploadSource(target: SourceTarget, file: File): Promise<void> {
  const kind = sourceKind(file)
  if (!kind) throw new AdminApiError('LUGU_INVALID_ARGUMENT')
  if (kind === 'text') return addTextSource(target, file.name, await file.text())
  const safe = file.name.normalize('NFKD').replace(/[^\w.-]+/g, '_')
  const path = `${target.curriculumId}/${target.versionId}/${crypto.randomUUID()}-${safe}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw toAdminError(error)
  const res = await db.from('curriculum_sources').insert({
    curriculum_id: target.curriculumId,
    version_id: target.versionId,
    lesson_id: target.lessonId,
    kind,
    title: file.name,
    storage_path: path,
  })
  if (res.error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw toAdminError(res.error)
  }
}

export async function deleteSource(source: CurriculumSource): Promise<void> {
  ok(await db.from('curriculum_sources').delete().eq('id', source.id))
  if (source.storage_path) await supabase.storage.from(BUCKET).remove([source.storage_path])
}

export async function sourceUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300)
  if (error || !data) throw toAdminError(error)
  return data.signedUrl
}

export interface LessonOption {
  id: string
  title: string
  sequence: number
  curriculumName: string
  version: number
}

/** Every non-archived lesson across curricula, for pickers. */
export async function listAllLessons(): Promise<LessonOption[]> {
  const [lessons, versions, curricula] = await Promise.all([
    db.from('curriculum_lessons').select('id, title, sequence, version_id').neq('status', 'archived').order('sequence').then(must),
    db.from('curriculum_versions').select('id, version, curriculum_id').neq('status', 'archived').then(must),
    db.from('curricula').select('id, name').then(must),
  ])
  return lessons.flatMap((l) => {
    const v = versions.find((x) => x.id === l.version_id)
    if (!v) return []
    return [{ id: l.id, title: l.title, sequence: l.sequence, version: v.version, curriculumName: curricula.find((c) => c.id === v.curriculum_id)?.name ?? '—' }]
  })
}
