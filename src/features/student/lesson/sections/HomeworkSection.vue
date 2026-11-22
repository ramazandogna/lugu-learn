<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'

import { CharacterBubble } from '@/design'
import { answerStage, currentQuestion, homeworkProgress, isHomeworkDone, restoreHomework, revealHint, setOrder, snapshotHomework, startHomework, type HomeworkStage, type StageResult } from '@/engine/homework'
import type { OrderState } from '@/engine/order'

import AnswerFeedback from '../components/AnswerFeedback.vue'
import PracticeQuestion from '../components/PracticeQuestion.vue'
import { toJson, useLesson } from '../context'

/* Linked groups on one sentence: complete → order → meaning. A wrong answer stays for a retry. */
const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()

const hw = snapshot ? restoreHomework(snapshot, ctx.pkg, ctx.rng) : startHomework(ctx.pkg, ctx.rng)
const version = ref(0)
const read = <T,>(f: () => T) => computed(() => (void version.value, f()))

const question = read(() => currentQuestion(hw))
const position = read(() => hw.current)
const order = read(() => hw.order)
const progress = read(() => homeworkProgress(hw))
const done = read(() => completed || isHomeworkDone(hw))
const hint = ref<string | null>(null)
const result = ref<StageResult | null>(null)

const STAGE: Record<HomeworkStage, string> = { complete: 'Cümleyi tamamla', order: 'Cümleyi sırala', meaning: 'Anlamını bul' }

function bump() {
  version.value++
  emit('state', snapshotHomework(hw))
}

function showHint() {
  hint.value = revealHint(hw)
  bump()
}

function placeOrder(s: OrderState) {
  setOrder(hw, s)
  bump()
}

function answer(response: number | string | string[], ms: number) {
  const q = question.value
  if (!q) return
  const r = answerStage(hw, response, ctx.rng, ms)
  if (!r) return
  result.value = r
  hint.value = null
  void ctx.recordAnswer({ section: 'homework', questionId: r.questionId, response: toJson(response), responseMs: ms, hintUsed: r.hintUsed })
  bump()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <CharacterBubble character="leo" size="sm">Her cümleyi üç adımda çalışacağız: tamamla, sırala, anlamını bul. Takılırsan ipucu alabilirsin.</CharacterBubble>
    <ProgressBar :value="progress.groupsDone" :max="progress.groups" :label="`${progress.groups} gruptan ${progress.groupsDone} tanesi tamamlandı`" />

    <AnswerFeedback v-if="result" :correct="result.correct" character="leo" :explain="result.explain">
      <p v-if="result.groupDone" class="text-ink mt-1 font-bold">Bu cümleyi bitirdin!</p>
    </AnswerFeedback>

    <template v-if="!done && question && position">
      <p class="type-eyebrow text-ink-soft">Cümle {{ position.group + 1 }} / {{ progress.groups }} · {{ STAGE[position.stage] }}</p>
      <PracticeQuestion :question="question" :order="order" :hint="hint" :hint-available="!!question.hint" @answer="answer" @order="placeOrder" @hint="showHint" />
    </template>

    <div v-else class="surface rounded-card flex flex-col gap-3 p-5">
      <p class="type-section text-ink">Ödevini tamamladın!</p>
      <BaseButton class="self-start" @click="emit('complete')">Devam et</BaseButton>
    </div>
  </div>
</template>
