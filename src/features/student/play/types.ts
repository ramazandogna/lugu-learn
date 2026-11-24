import type { CharacterKey } from '@/domain/content'

/** One pinned step of `ScrollStory`. */
export interface StoryStepView {
  id: string
  speaker: CharacterKey | 'narrator'
  /** The big line (English, or the Turkish idea of an explanation step). */
  en: string
  tr?: string | undefined
  /** Small heading above the line. */
  title?: string | undefined
  /** Words to underline in `en` (at most two). */
  emphasis?: readonly string[] | undefined
  joke?: { tr: string; en?: string | undefined } | undefined
  /** An answer gate: the learner cannot go on until the parent says it is open. */
  gate?: string | undefined
  /** `en` is Turkish (explanations): language tag + no read-aloud. */
  lang?: 'en' | 'tr' | undefined
}

/** One question of a timed round. */
export interface TimedQ {
  id: string
  prompt: string
  options: string[]
  answer: number
  lang?: { prompt: 'en' | 'tr'; option: 'en' | 'tr' } | undefined
}

/** One "bana tıkla" guide. */
export interface GuideView {
  id: string
  label: string
  hint: { fine: string; big?: string | undefined }
  joke?: { tr: string } | undefined
}
