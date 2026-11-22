import type { z } from 'zod'
import { LessonPackage } from '@/domain/content'
import type { PackageStatus } from '@/lib/database.types'

/** Moves one item; out-of-range moves return the list unchanged (a new array either way). */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list]
  if (from < 0 || from >= next.length || to < 0 || to >= next.length || from === to) return next
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item as T)
  return next
}

const SECTION_NAMES: Record<string, string> = {
  meta: 'Genel bilgiler',
  review: 'Tekrar',
  vocabulary: 'Kelimeler',
  story: 'Hikâye',
  explanation: 'Konu anlatımı',
  homework: 'Ödev',
  assessment: 'Değerlendirme',
  completion: 'Tamamlama kuralları',
}

const FIELD_NAMES: Record<string, string> = {
  title: 'başlık',
  tagline: 'kısa açıklama',
  theme: 'tema',
  level: 'seviye',
  estimatedMinutes: 'tahmini süre',
  objectives: 'hedefler',
  en: 'İngilizce',
  tr: 'Türkçe',
  example: 'örnek',
  difficulty: 'zorluk',
  id: 'kimlik',
  prompt: 'soru metni',
  options: 'seçenekler',
  answer: 'doğru cevap',
  accept: 'kabul edilen cevaplar',
  tokens: 'kelime parçaları',
  scenes: 'sahneler',
  lines: 'replikler',
  questions: 'sorular',
  steps: 'adımlar',
  body: 'metin',
  groups: 'gruplar',
  quiz: 'test',
  reading: 'okuma',
  paragraphs: 'paragraflar',
  objectiveId: 'hedef',
  vocabId: 'kelime',
  speaker: 'konuşan',
  character: 'karakter',
  setting: 'mekân',
}

function pathLabel(path: readonly PropertyKey[]): string {
  const parts: string[] = []
  path.forEach((p, i) => {
    if (i === 0 && typeof p === 'string') parts.push(SECTION_NAMES[p] ?? p)
    else if (typeof p === 'number') parts.push(`${p + 1}.`)
    else if (typeof p === 'string') parts.push(FIELD_NAMES[p] ?? p)
  })
  return parts.join(' › ')
}

function issueText(issue: z.core.$ZodIssue): string {
  switch (issue.code) {
    case 'too_small':
      return issue.origin === 'array' ? `en az ${String(issue.minimum)} öğe olmalı` : issue.origin === 'string' ? 'boş bırakılamaz' : `en az ${String(issue.minimum)} olmalı`
    case 'too_big':
      return issue.origin === 'array' ? `en fazla ${String(issue.maximum)} öğe olabilir` : `en fazla ${String(issue.maximum)} olabilir`
    case 'invalid_type':
      return 'eksik veya geçersiz değer'
    case 'invalid_format':
      return issue.message.startsWith('id') ? 'kimlik küçük harf, rakam ve tire içermeli' : 'biçim geçersiz'
    case 'invalid_value':
      return 'izin verilmeyen değer'
    case 'custom':
      return customText(issue.message)
    default:
      return issue.message
  }
}

function customText(message: string): string {
  const m = (re: RegExp) => re.exec(message)
  let r: RegExpExecArray | null
  if ((r = m(/^duplicate id "(.+)"/))) return `"${r[1]}" kimliği birden fazla kez kullanılmış`
  if ((r = m(/^(.+): answer outside options/))) return `${r[1]}: doğru cevap seçeneklerin dışında`
  if ((r = m(/^(.+): duplicate options/))) return `${r[1]}: aynı seçenek iki kez yazılmış`
  if ((r = m(/^(.+): tokens are not a permutation of answer/))) return `${r[1]}: parçalar doğru cevaptaki kelimelerle aynı olmalı`
  if ((r = m(/^(.+): unknown objective (.+)/))) return `${r[1]}: bilinmeyen hedef "${r[2]}"`
  if ((r = m(/^(.+): unknown vocabulary (.+)/))) return `${r[1]}: bilinmeyen kelime "${r[2]}"`
  if ((r = m(/^(.+): assessment repeats a homework question/))) return `${r[1]}: değerlendirme sorusu ödevdeki bir soruyu tekrar ediyor`
  return message
}

/** Validates a package draft; issues come back as Turkish sentences with their place in the document. */
export function validatePackage(content: unknown): { ok: true; value: LessonPackage } | { ok: false; issues: string[] } {
  const res = LessonPackage.safeParse(content)
  if (res.success) return { ok: true, value: res.data }
  return {
    ok: false,
    issues: res.error.issues.map((i) => {
      const where = pathLabel(i.path)
      return where ? `${where}: ${issueText(i)}` : issueText(i)
    }),
  }
}

/** The next step of the review workflow for each status (null: nothing forward). */
export const NEXT_STATUS: Record<PackageStatus, PackageStatus | null> = {
  draft: 'qa',
  ai_generated: 'qa',
  qa: 'review',
  review: 'approved',
  approved: 'published',
  published: null,
  archived: null,
}

/** Lowercase slug for new ids: `have breakfast` → `have-breakfast`. */
export function slugId(text: string, taken: ReadonlySet<string>, prefix = 'item'): string {
  const base =
    text
      .toLocaleLowerCase('en')
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || prefix
  let id = /^[a-z0-9]/.test(base) ? base : `${prefix}-${base}`
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
  return id
}

export const JOB_STAGES = ['plan', 'content_core', 'content_practice', 'content_assessment', 'qa', 'revision', 'admin_material', 'save', 'done'] as const

const STAGE_LABEL: Record<string, string> = {
  plan: 'Ders planı hazırlanıyor',
  content_core: 'Kelimeler ve hikâye yazılıyor',
  content_practice: 'Konu anlatımı ve ödev hazırlanıyor',
  content_assessment: 'Değerlendirme hazırlanıyor',
  qa: 'Kalite kontrolü yapılıyor',
  revision: 'Sorunlu bölümler düzeltiliyor',
  admin_material: 'Öğretmen rehberi ve konuşma planı hazırlanıyor',
  save: 'Taslak kaydediliyor',
  done: 'Tamamlandı',
}

/** `qa_round_2` → qa, `stalled:plan` → plan (stalled). */
export function stageInfo(stage: string | null): { label: string; step: number; total: number; stalled: boolean } {
  const total = JOB_STAGES.length
  if (!stage) return { label: 'Sırada bekliyor', step: 0, total, stalled: false }
  const stalled = stage.startsWith('stalled:')
  const raw = stalled ? stage.slice('stalled:'.length) : stage
  const key = raw.startsWith('qa_round') ? 'qa' : raw.startsWith('revision') ? 'revision' : raw
  const idx = JOB_STAGES.indexOf(key as (typeof JOB_STAGES)[number])
  const round = /_(\d+)$/.exec(raw)?.[1]
  const label = (STAGE_LABEL[key] ?? raw) + (round && key !== raw ? ` (${round}. tur)` : '')
  return { label: stalled ? `${label} — durdu` : label, step: idx < 0 ? 0 : idx + 1, total, stalled }
}

type Q = LessonPackage['assessment']['quiz'][number]
export type QuestionType = Q['type']

export function blankQuestion(type: QuestionType, id: string): Q {
  if (type === 'choice') return { id, type, prompt: '', options: ['', ''], answer: 0 }
  if (type === 'order') return { id, type, prompt: '', tokens: [], answer: [] }
  return { id, type, prompt: '', accept: [''] }
}

/** Every id used inside a package (vocabulary, scenes, steps, groups, questions). */
export function collectIds(p: LessonPackage): Set<string> {
  const ids = new Set<string>()
  const q = (x: { id: string } | undefined) => x && ids.add(x.id)
  p.meta.objectives.forEach(q)
  p.vocabulary.forEach(q)
  p.review.questions.forEach(q)
  p.story.scenes.forEach(q)
  p.story.questions.forEach(q)
  p.explanation.steps.forEach((s) => (q(s), q(s.check)))
  p.homework.groups.forEach((g) => (q(g), q(g.complete), q(g.order), q(g.meaning)))
  p.assessment.quiz.forEach(q)
  p.assessment.reading.questions.forEach(q)
  return ids
}

export function blankPackage(title: string, minutes: number): LessonPackage {
  return {
    schemaVersion: 1,
    meta: { title, tagline: '', theme: '', character: 'piko', level: 'A1', estimatedMinutes: Math.min(180, Math.max(5, minutes)), objectives: [], grammar: [] },
    review: { questions: [] },
    vocabulary: [],
    story: { title: '', character: 'piko', setting: '', scenes: [], questions: [] },
    explanation: { steps: [] },
    homework: { groups: [] },
    assessment: { quiz: [], reading: { title: '', paragraphs: [], questions: [] } },
    completion: { requireVocabMastery: true, requireStory: true, requireHomework: true, requireAssessment: true, minAssessmentPercent: 0 },
  }
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * An editable copy of a stored document, even one that does not validate
 * (an AI draft with a blocker): known sections are kept, missing ones are
 * filled from the blank package so the editor always has something to bind.
 */
export function toDraft(raw: unknown, fallbackTitle: string, minutes: number): LessonPackage {
  const base = blankPackage(fallbackTitle, minutes)
  if (!isObj(raw)) return base
  const copy = JSON.parse(JSON.stringify(raw)) as Obj
  const merge = (b: Obj, r: unknown): Obj => {
    if (!isObj(r)) return b
    const out: Obj = { ...b }
    for (const [k, v] of Object.entries(r)) out[k] = isObj(b[k]) && isObj(v) ? merge(b[k] as Obj, v) : v
    return out
  }
  return merge(base as unknown as Obj, copy) as unknown as LessonPackage
}
