import type { ContextBlock } from './model.ts'

/** One admin-supplied curriculum source, already loaded from `curriculum_sources` / Storage. */
export type CurriculumSource =
  | { id: string; kind: 'text' | 'document'; title: string; text: string }
  | { id: string; kind: 'pdf'; title: string; base64: string }
  | {
      id: string
      kind: 'image'
      title: string
      mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
      base64: string
    }

export interface PreviousLesson {
  sequence: number
  title: string
  /** English vocabulary phrases taught (from the published package). */
  vocabulary: string[]
  grammar: string[]
}

/** Class-level, anonymised: no student ids, only aggregate error rates per item. */
export interface ClassWeakItem {
  label: string
  errorRate: number
  attempts: number
}

/** Everything the lesson pipeline knows. Contains no student personal data by construction. */
export interface LessonContext {
  curriculum: { name: string; grade: string | null; targetLevel: string | null; description: string | null }
  lesson: {
    id: string
    sequence: number
    title: string
    objectives: { id: string; text: string }[]
    estimatedMinutes: number | null
    sourceNotes: string | null
  }
  sources: CurriculumSource[]
  /** Earlier lessons of the same curriculum version, in order. */
  previousLessons: PreviousLesson[]
  classWeakItems: ClassWeakItem[]
  /** Free-text instructions the admin typed for this generation run. */
  adminInstructions: string | null
}

/** Max characters of one text source (≈ 25k tokens); longer text is rejected, not truncated. */
export const MAX_TEXT_SOURCE_CHARS = 100_000

/**
 * Renders the shared context once per job. The same blocks open every stage's
 * request, so the adapter can put the prompt-cache breakpoint on the last one.
 */
export function buildLessonContextBlocks(ctx: LessonContext): ContextBlock[] {
  const header = {
    curriculum: ctx.curriculum,
    lesson: ctx.lesson,
    previousLessons: ctx.previousLessons,
    classWeakItems: ctx.classWeakItems,
    adminInstructions: ctx.adminInstructions,
  }
  const blocks: ContextBlock[] = [
    {
      type: 'text',
      text: [
        '<lesson_context>',
        'The lesson to build, its place in the curriculum, and what earlier lessons already taught.',
        'Earlier lessons\' vocabulary and grammar are known to the learner: reuse them for review, and do not introduce grammar beyond this lesson and earlier ones.',
        'classWeakItems are anonymised class-level aggregates; use them only to choose review items.',
        JSON.stringify(header, null, 2),
        '</lesson_context>',
      ].join('\n'),
    },
  ]
  for (const s of ctx.sources) {
    if (s.kind === 'pdf') blocks.push({ type: 'document', title: s.title, mediaType: 'application/pdf', base64: s.base64 })
    else if (s.kind === 'image') {
      blocks.push({ type: 'text', text: `<curriculum_source id="${s.id}" kind="image" title="${s.title}">(image follows)</curriculum_source>` })
      blocks.push({ type: 'image', mediaType: s.mediaType, base64: s.base64 })
    } else {
      blocks.push({
        type: 'text',
        text: `<curriculum_source id="${s.id}" kind="${s.kind}" title="${s.title}">\n${s.text}\n</curriculum_source>`,
      })
    }
  }
  return blocks
}

/** Encodes bytes to base64 without `Buffer` or `Deno` (works in both runtimes). */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  return btoa(binary)
}
