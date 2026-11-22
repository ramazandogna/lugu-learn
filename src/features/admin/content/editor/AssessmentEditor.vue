<script setup lang="ts">
import { computed } from 'vue'
import { BaseInput, BaseTextarea } from 'rei-kit'
import type { LessonPackage } from '@/domain/content'
import QuestionListEditor from './QuestionListEditor.vue'

const pkg = defineModel<LessonPackage>({ required: true })

const paragraphs = computed({
  get: () => pkg.value.assessment.reading.paragraphs.join('\n\n'),
  set: (s: string) =>
    (pkg.value.assessment.reading.paragraphs = s
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)),
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <p class="text-ink-soft text-sm">Değerlendirmede ipucu ve açıklama gösterilmez; sorular ödevdekilerden farklı olmalı.</p>
    <section class="flex flex-col gap-2" aria-label="Test">
      <h3 class="font-semibold">Test (yaklaşık 10 soru)</h3>
      <QuestionListEditor v-model="pkg.assessment.quiz" prefix="quiz" label="Test sorusu ekle" no-hints />
    </section>
    <section class="flex flex-col gap-3" aria-label="Okuma">
      <h3 class="font-semibold">Okuma</h3>
      <BaseInput v-model="pkg.assessment.reading.title" size="sm" label="Okuma metni başlığı" />
      <BaseTextarea v-model="paragraphs" size="sm" label="Metin (paragrafları boş satırla ayırın)" :rows="8" />
      <QuestionListEditor v-model="pkg.assessment.reading.questions" prefix="reading" label="Okuma sorusu ekle" :types="['choice', 'text']" no-hints />
    </section>
    <section class="flex flex-col gap-2" aria-label="Tekrar">
      <h3 class="font-semibold">Tekrar soruları (isteğe bağlı, en fazla 8)</h3>
      <p class="text-ink-soft text-sm">Ders başındaki tekrar bölümü; uygulama öğrencinin önceki derslerdeki zayıf öğelerini de ekler.</p>
      <QuestionListEditor v-model="pkg.review.questions" prefix="review" label="Tekrar sorusu ekle" />
    </section>
  </div>
</template>
