/** Picks the template for a lesson section: package `play` first, else the default mapping (patterns.md §9). */
import {
  SECTION_TEMPLATES,
  type ExtraPlay,
  type LessonPackage,
  type SectionKey,
  type SectionPlay,
  type TemplateId,
  type ThemeId,
} from '@/domain/content'

export interface ResolvedPlay {
  section: SectionKey
  template: Exclude<TemplateId, 'imagine' | 'inspire-worlds'>
  /** `scroll-story` only: default depends on the section. */
  mode?: 'story' | 'vocab-reveal'
  /** Authored slots; undefined = UI derives them from the package content. */
  slots: SectionPlay['slots'] | undefined
  /** Per-lesson hint allowance (assessment is always 0). */
  hintBudget: number
  timed: boolean
  themeId: ThemeId
  /** false = old package / no `play` entry (legacy behaviour). */
  authored: boolean
}

const DEFAULT_HINTS: Record<SectionKey, number> = { review: 2, vocabulary: 0, vocab_quiz: 2, story: 2, explanation: 3, homework: 2, assessment: 0 }

export const themeOf = (pkg: Pick<LessonPackage, 'meta'>): ThemeId => pkg.meta.themeId ?? 'base'

export function resolvePlay(pkg: Pick<LessonPackage, 'meta' | 'play'>, section: SectionKey): ResolvedPlay {
  const themeId = themeOf(pkg)
  const sp = pkg.play?.sections[section]
  const allowed = SECTION_TEMPLATES[section]
  const picked = sp && allowed.includes(sp.template) ? sp : undefined
  // time-escape with `timed:false` degrades to the untimed default (stamp-quiz)
  const untimed = picked?.template === 'time-escape' && picked.timed === false
  const template = (untimed ? 'stamp-quiz' : (picked?.template ?? allowed[0])) as ResolvedPlay['template']
  const hintBudget = section === 'assessment' ? 0 : (picked?.hintBudget ?? DEFAULT_HINTS[section])
  return {
    section,
    template,
    mode: template === 'scroll-story' ? (section === 'story' ? 'story' : 'vocab-reveal') : undefined,
    slots: untimed ? undefined : picked?.slots,
    hintBudget,
    timed: template === 'time-escape',
    themeId,
    authored: picked !== undefined,
  }
}

export const resolveExtras = (pkg: Pick<LessonPackage, 'play'>): ExtraPlay[] => pkg.play?.extras ?? []
