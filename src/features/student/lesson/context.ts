import { inject, type InjectionKey, type Ref } from 'vue'

import type { CharacterKey, SectionKey } from '@/domain/content'
import type { Rng } from '@/engine/mastery'
import type { QueueStatus } from '@/lib/api/student'
import type { AnswerResult, AssessmentScore, Json, SessionKind, VocabAnswerResult, VocabDirection } from '@/lib/database.types'

import type { StudentPackage } from './package'

/** What every section needs from the player. Writes go through the session's queue. */
export interface LessonContext {
  pkg: StudentPackage
  sessionId: string
  lessonId: string
  kind: SessionKind
  /** Vocabulary ids already mastered before this session (empty for a replay). */
  preMastered: readonly string[]
  rng: Rng
  character: CharacterKey
  saving: Ref<QueueStatus>
  /** Latest resume snapshot of a section; coalesced, never blocks the UI. */
  saveState(section: SectionKey, snapshot: unknown): void
  recordAnswer(a: { section: SectionKey; questionId: string; response: Json; responseMs: number; hintUsed: boolean }): Promise<AnswerResult | undefined>
  recordVocab(a: { itemId: string; direction: VocabDirection; chosen: string; responseMs: number }): Promise<VocabAnswerResult | undefined>
  submitAssessment(answers: Record<string, number | string | string[]>): Promise<AssessmentScore>
  /** Says a write went wrong, kindly; never throws. */
  report(e: unknown): void
}

export const LESSON: InjectionKey<LessonContext> = Symbol('lesson')

export function useLesson(): LessonContext {
  const ctx = inject(LESSON)
  if (!ctx) throw new Error('useLesson() outside LessonView')
  return ctx
}

/** Engine state → JSON for `save_section_state` (drops `undefined`, copies). */
export const toJson = (v: unknown): Json => JSON.parse(JSON.stringify(v ?? null)) as Json
