import type { Component } from 'vue'

import type { SectionKey } from '@/domain/content'

import AssessmentSection from './sections/AssessmentSection.vue'
import ExplanationSection from './sections/ExplanationSection.vue'
import HomeworkSection from './sections/HomeworkSection.vue'
import ReviewSection from './sections/ReviewSection.vue'
import StorySection from './sections/StorySection.vue'
import VocabQuizSection from './sections/VocabQuizSection.vue'
import VocabularySection from './sections/VocabularySection.vue'

export const SECTION_LABEL: Record<SectionKey, string> = {
  review: 'Isınma oyunu',
  vocabulary: 'Kelimeler',
  vocab_quiz: 'Kelime oyunu',
  story: 'Hikâye',
  explanation: 'Konu anlatımı',
  homework: 'Ödev',
  assessment: 'Değerlendirme',
}

export const SECTION_COMPONENT: Record<SectionKey, Component> = {
  review: ReviewSection,
  vocabulary: VocabularySection,
  vocab_quiz: VocabQuizSection,
  story: StorySection,
  explanation: ExplanationSection,
  homework: HomeworkSection,
  assessment: AssessmentSection,
}
