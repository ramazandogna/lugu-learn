<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseButton, BaseInput } from 'rei-kit'

import { HintBubble, StampOption } from '@/design'
import type { Question } from '@/domain/content'
import { isComplete, newOrderState, orderResponse, type OrderState } from '@/engine/order'

import OrderBoard from './OrderBoard.vue'

/*
 * One practice question (choice / text / order) with "Kontrol et". Grading
 * and attempts belong to the caller's engine; this only collects a response.
 * `order` may be owned by the caller (homework engine) or kept here.
 */
const {
  question,
  order = null,
  hint = null,
  hintAvailable = false,
  locked = false,
} = defineProps<{
  question: Question
  order?: OrderState | null
  hint?: string | null
  hintAvailable?: boolean
  /** Answer accepted: no more changes until the caller moves on. */
  locked?: boolean
}>()
const emit = defineEmits<{ answer: [response: number | string | string[], ms: number]; order: [state: OrderState]; hint: [] }>()

const choice = ref<number | null>(null)
const text = ref('')
const ownOrder = ref<OrderState | null>(null)
let shownAt = Date.now()

watch(
  () => question.id,
  () => {
    choice.value = null
    text.value = ''
    ownOrder.value = question.type === 'order' ? newOrderState(question.tokens, Math.random, question.answer) : null
    shownAt = Date.now()
  },
  { immediate: true },
)

const board = computed(() => order ?? ownOrder.value)
const ready = computed(() => {
  if (question.type === 'choice') return choice.value !== null
  if (question.type === 'text') return text.value.trim() !== ''
  return !!board.value && isComplete(board.value)
})

function setOrder(s: OrderState) {
  if (order) emit('order', s)
  else ownOrder.value = s
}

function check() {
  if (!ready.value || locked) return
  const ms = Date.now() - shownAt
  if (question.type === 'choice' && choice.value !== null) emit('answer', choice.value, ms)
  else if (question.type === 'text') emit('answer', text.value, ms)
  else if (board.value) emit('answer', orderResponse(board.value), ms)
}

/** After a wrong answer the caller may reset; a fresh attempt restarts the timer. */
function retry() {
  shownAt = Date.now()
}
defineExpose({ retry })
</script>

<template>
  <form class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6" @submit.prevent="check">
    <p class="type-task text-ink">{{ question.prompt }}</p>

    <fieldset v-if="question.type === 'choice'" class="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend class="sr-only">{{ question.prompt }}</legend>
      <StampOption v-for="(opt, i) in question.options" :key="i" v-model="choice" :name="question.id" :value="i" :disabled="locked">
        {{ opt }}
      </StampOption>
    </fieldset>

    <BaseInput v-else-if="question.type === 'text'" v-model="text" label="Cevabın" :disabled="locked" autocomplete="off" autocapitalize="off" spellcheck="false" />

    <OrderBoard v-else-if="board" :state="board" :disabled="locked" label="Kelimeleri doğru sıraya koy" @update="setOrder" />

    <HintBubble v-if="hint" :closable="false">{{ hint }}</HintBubble>

    <div class="flex flex-wrap gap-2">
      <BaseButton type="submit" :disabled="!ready || locked">Kontrol et</BaseButton>
      <BaseButton v-if="hintAvailable && !hint && !locked" variant="quiet" @click="emit('hint')">İpucu göster</BaseButton>
    </div>
  </form>
</template>
