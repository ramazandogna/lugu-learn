<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseButton } from 'rei-kit'

import { HintBubble, StampOption } from '@/design'
import type { Question } from '@/domain/content'

import PracticeQuestion from '../lesson/components/PracticeQuestion.vue'

/*
 * One question on one screen. Choice: stamp options; the moment one is picked
 * the right one (green-honey) and the learner's own pick (amber, "senin
 * seçimin") show together, with one line of why under the pick. Order / text
 * keep the existing "Kontrol et" renderer. Grading and recording are the
 * parent's job; this only collects a response.
 */
const {
  question,
  order,
  picked = null,
  locked = false,
  hint = null,
  hintAvailable = false,
  reason = null,
  visible,
  lang,
  reveal = true,
} = defineProps<{
  question: Question
  /** Display order of the choice options (indices into `options`). */
  order?: readonly number[] | undefined
  picked?: number | null
  locked?: boolean
  hint?: string | null
  hintAvailable?: boolean
  /** The one line under the learner's wrong pick. */
  reason?: string | null
  /** Option indices still on show (hints / softer difficulty drop options). */
  visible?: readonly number[] | undefined
  lang?: { prompt: 'en' | 'tr'; option: 'en' | 'tr' } | undefined
  /** false = a wrong pick does not show the right option (the learner tries again). */
  reveal?: boolean
}>()
const emit = defineEmits<{ answer: [response: number | string | string[], ms: number]; hint: [] }>()

let shownAt = Date.now()
const group = ref<number | null>(null)
/* A new question starts with nothing chosen (a leftover choice would look picked and ignore the same tap). */
watch(
  () => question.id,
  () => {
    shownAt = Date.now()
    group.value = null
  },
)

const shown = computed<number[]>(() => {
  if (question.type !== 'choice') return []
  const base = order ?? question.options.map((_, i) => i)
  return base.filter((i) => (!visible || visible.includes(i)) || i === question.answer || i === picked)
})
const answered = computed(() => picked !== null)

function pick(v: number | null) {
  if (v === null || answered.value || locked) return
  group.value = v
  emit('answer', v, Date.now() - shownAt)
}

const resultOf = (i: number): 'correct' | 'wrong' | 'dim' | undefined => {
  if (question.type !== 'choice' || picked === null) return undefined
  if (i === question.answer) return reveal || picked === i ? 'correct' : undefined
  if (i === picked) return 'wrong'
  return reveal ? 'dim' : undefined
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PracticeQuestion
      v-if="question.type !== 'choice'"
      :question="question"
      :hint="hint"
      :hint-available="hintAvailable"
      :locked="locked"
      @answer="(r, ms) => emit('answer', r, ms)"
      @hint="emit('hint')"
    />
    <template v-else>
      <p class="type-task text-ink" :lang="lang?.prompt">{{ question.prompt }}</p>
      <fieldset class="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <legend class="sr-only">{{ question.prompt }}</legend>
        <div v-for="i in shown" :key="`${question.id}-${i}`" class="flex flex-col gap-1">
          <StampOption :model-value="picked ?? group" :name="question.id" :value="i" :disabled="locked || answered" :result="resultOf(i)" @update:model-value="pick">
            <span :lang="lang?.option">{{ question.options[i] }}</span>
          </StampOption>
          <p v-if="reason && picked === i && i !== question.answer" class="type-body text-ink ps-4" role="status">
            <span class="font-bold">İlginç seçim, bak:</span> {{ reason }}
          </p>
        </div>
      </fieldset>
      <HintBubble v-if="hint" :closable="false">{{ hint }}</HintBubble>
      <BaseButton v-if="hintAvailable && !hint && !answered && !locked" variant="quiet" class="self-start" @click="emit('hint')">İpucu göster</BaseButton>
    </template>
  </div>
</template>
