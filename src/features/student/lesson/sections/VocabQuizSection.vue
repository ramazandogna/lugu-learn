<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'

import { CharacterBubble } from '@/design'
import { MASTERY } from '@/engine/mastery'
import { answerVocab, currentDirection, isVocabQuizDone, nextVocabQuestion, restoreVocabQuiz, snapshotVocabQuiz, startVocabQuiz, vocabQuizProgress } from '@/engine/vocab-quiz'

import AnswerFeedback from '../components/AnswerFeedback.vue'
import MasteryList from '../components/MasteryList.vue'
import { useLesson } from '../context'

/*
 * Vocabulary mastery quiz: two correct answers since the last miss per word
 * (engine). A missed word comes back; from its second miss with two options.
 * Accuracy is shown only as a side note — mastery decides.
 */
const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()

// The engine mutates in place; `version` is the reactive signal for it.
const quiz = snapshot ? restoreVocabQuiz(snapshot, ctx.pkg, ctx.rng, ctx.preMastered) : startVocabQuiz(ctx.pkg, ctx.rng, ctx.preMastered)
const version = ref(0)
const read = <T,>(f: () => T) => computed(() => (void version.value, f()))
let shownAt = Date.now()

const q = read(() => quiz.state.question)
const picked = read(() => quiz.state.picked)
const done = read(() => isVocabQuizDone(quiz))
const progress = read(() => vocabQuizProgress(quiz))
const direction = read(() => currentDirection(quiz))
const options = computed(() => (q.value ? quiz.state.order.map((i) => ({ i, text: q.value!.options[i]! })) : []))
const expected = computed(() => q.value?.options[q.value.answer] ?? '')
const mastery = read(() => {
  const pre = new Set(quiz.preMastered)
  return ctx.pkg.vocabulary.map((v) => ({ id: v.id, en: v.en, tr: v.tr, count: pre.has(v.id) ? MASTERY : Math.min(MASTERY, quiz.state.counts.get(v.id) ?? 0) }))
})

function bump() {
  version.value++
  emit('state', snapshotVocabQuiz(quiz))
}

function pick(i: number) {
  const a = answerVocab(quiz, i, ctx.rng)
  if (!a) return
  void ctx.recordVocab({ itemId: a.vocabId, direction: a.direction, chosen: a.chosenText, responseMs: Date.now() - shownAt })
  bump()
}

function next() {
  nextVocabQuestion(quiz, ctx.rng)
  shownAt = Date.now()
  bump()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <CharacterBubble character="sasha" size="sm">Her kelimeyi art arda iki kez doğru bilince o kelimeyi öğrenmiş olursun. Yanlış yapmak sorun değil, kelime tekrar gelir!</CharacterBubble>
    <ProgressBar :value="progress.mastered" :max="progress.total" :label="`${progress.total} kelimeden ${progress.mastered} tanesini öğrendin`" />
    <p class="text-ink-soft type-small">
      {{ progress.mastered }} / {{ progress.total }} kelime öğrenildi
      <template v-if="progress.accuracyPercent !== null"> · Doğru cevap oranın %{{ progress.accuracyPercent }} (sadece bilgi için)</template>
    </p>

    <div v-if="done || completed" class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
      <p class="type-section text-ink">Tüm kelimeleri öğrendin!</p>
      <BaseButton class="self-start" @click="emit('complete')">Devam et</BaseButton>
    </div>

    <div v-else-if="q" class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6">
      <p class="type-eyebrow text-ink-soft">{{ direction === 'en_tr' ? 'Türkçesi ne?' : 'İngilizcesi ne?' }}</p>
      <p class="type-title text-ink" :lang="direction === 'en_tr' ? 'en' : 'tr'">{{ q.prompt }}</p>
      <div class="grid gap-2 sm:grid-cols-2" role="group" aria-label="Seçenekler">
        <BaseButton
          v-for="o in options"
          :key="o.i"
          variant="secondary"
          size="lg"
          :pressed="picked === o.i"
          :disabled="picked !== null"
          :lang="direction === 'en_tr' ? 'tr' : 'en'"
          @click="pick(o.i)"
        >
          {{ o.text }}
        </BaseButton>
      </div>
      <AnswerFeedback v-if="picked !== null" :correct="picked === q.answer" character="sasha" :explain="picked === q.answer ? null : `Doğrusu: ${expected}`" />
      <BaseButton v-if="picked !== null" class="self-start" @click="next">Sıradaki</BaseButton>
    </div>

    <MasteryList :items="mastery" :goal="MASTERY" />
  </div>
</template>
