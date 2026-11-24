<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton } from 'rei-kit'

import { CharacterBubble, JarProgress } from '@/design'
import { answerStage, currentQuestion, homeworkProgress, isHomeworkDone, restoreHomework, revealHint, snapshotHomework, startHomework, type StageResult } from '@/engine/homework'
import type { FillWorkshopSlots } from '@/domain/content'
import type { ResolvedPlay } from '@/play/resolve-play'

import FillWorkshop from '../../play/FillWorkshop.vue'
import QuestionCard from '../../play/QuestionCard.vue'
import { toJson, useLesson } from '../context'

/*
 * Linked groups on one sentence: complete → order → meaning. Building the
 * sentence is the fill-workshop (tap a piece, tap a gap); the meaning question
 * is a stamp. A wrong answer stays for a retry. Grading, saving and the
 * server score are the lesson's own engine, unchanged.
 */
const { snapshot, completed = false, play } = defineProps<{ snapshot?: unknown; completed?: boolean; play?: ResolvedPlay }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()

const hw = snapshot ? restoreHomework(snapshot, ctx.pkg, ctx.rng) : startHomework(ctx.pkg, ctx.rng)
const version = ref(0)
const read = <T,>(f: () => T) => computed(() => (void version.value, f()))

const question = read(() => currentQuestion(hw))
const position = read(() => hw.current)
const progress = read(() => homeworkProgress(hw))
const done = read(() => completed || isHomeworkDone(hw))
const hint = ref<string | null>(null)
const result = ref<StageResult | null>(null)
const hintsLeft = ref(play?.hintBudget ?? 2)

const STAGE: Record<string, string> = { complete: 'Cümleyi tamamla', order: 'Cümleyi sırala', meaning: 'Anlamını bul' }
const slotItems = computed(() => ((play?.slots ?? undefined) as FillWorkshopSlots | undefined)?.items ?? [])
const item = computed(() => slotItems.value.find((i) => i.ref === question.value?.id))
const slotHint = computed(() => ((play?.slots ?? undefined) as FillWorkshopSlots | undefined)?.hint)
const stamp = computed(() => question.value?.type === 'choice' && (position.value?.stage === 'meaning' || play?.template === 'stamp-quiz'))

function bump() {
  version.value++
  emit('state', snapshotHomework(hw))
}

function showHint() {
  if (hintsLeft.value <= 0) return
  const h = revealHint(hw) ?? slotHint.value?.fine ?? null
  if (h === null) return
  hintsLeft.value--
  hint.value = h
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

/* meaning stamps: a right pick is held until "Sonraki"; a wrong one is recorded at once and tried again */
const picked = ref<number | null>(null)
const held = ref<{ q: NonNullable<typeof question.value>; response: number; ms: number } | null>(null)
const reason = computed(() => (picked.value !== null && question.value?.type === 'choice' && picked.value !== question.value.answer ? (question.value.explain ?? null) : null))
function stampPick(response: number | string | string[], ms: number) {
  const q = question.value
  if (!q || typeof response !== 'number') return
  picked.value = response
  if (q.type === 'choice' && response === q.answer) held.value = { q, response, ms }
  else answer(response, ms)
}
function stampNext() {
  const h = held.value
  held.value = null
  picked.value = null
  if (h) answer(h.response, h.ms)
}
const stampRight = computed(() => held.value !== null)
</script>

<template>
  <div class="flex flex-col gap-4">
    <CharacterBubble character="leo" size="sm">Her cümleyi üç adımda çalışacağız: tamamla, sırala, anlamını bul. Parçaya dokun, boşluğa dokun. Takılırsan ipucu alabilirsin.</CharacterBubble>
    <JarProgress :value="progress.groupsDone" :max="progress.groups" size="sm" :label="`${progress.groups} gruptan ${progress.groupsDone} tanesi tamamlandı`"><p class="type-small text-ink font-bold">{{ progress.groups }} gruptan {{ progress.groupsDone }} tamam</p></JarProgress>
    <p v-if="result?.correct && result.groupDone" class="type-task text-ink" role="status">Bu cümleyi bitirdin!</p>

    <template v-if="!done && question && position">
      <p class="type-eyebrow text-ink-soft">Cümle {{ position.group + 1 }} / {{ progress.groups }} · {{ STAGE[position.stage] }}</p>
      <div v-if="stamp && question.type === 'choice'" class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6">
        <QuestionCard :question="question" :picked="picked" :reveal="stampRight" :reason="reason" :hint="hint" @answer="stampPick" />
        <p v-if="picked !== null && !stampRight" class="type-body text-ink" role="status"><span class="font-bold">Yaklaştın!</span> Bir daha bak, sen yaparsın.</p>
        <div class="flex flex-wrap gap-2">
          <BaseButton v-if="stampRight" size="lg" @click="stampNext">Sonraki</BaseButton>
          <BaseButton v-else-if="picked !== null" size="lg" @click="picked = null">Bir daha dene</BaseButton>
          <BaseButton v-if="hintsLeft > 0 && !hint && !!question.hint && picked === null" variant="quiet" @click="showHint">İpucu göster</BaseButton>
        </div>
      </div>
      <FillWorkshop
        v-else
        :question="question"
        :scene-object="item?.sceneObject"
        :on-complete="item?.onComplete"
        :hint="hint"
        :hint-available="hintsLeft > 0 && (!!question.hint || !!slotHint)"
        :character="'leo'"
        @answer="answer"
        @hint="showHint"
      />
    </template>

    <div v-else class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
      <p class="type-section text-ink">Ödevini tamamladın!</p>
      <BaseButton class="self-start" @click="emit('complete')">Devam et</BaseButton>
    </div>
  </div>
</template>
