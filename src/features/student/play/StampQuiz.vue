<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'
import { CircleCheck, Lightbulb } from 'lucide-vue-next'

import { LuguMascot, playSound } from '@/design'
import type { CharacterKey, Question } from '@/domain/content'
import { nextDifficulty, wrongStage } from '@/play/ladder'
import { createRunStreak } from '@/play/run-streak'
import { stepsOf } from './tr'

import QuestionCard from './QuestionCard.vue'
import StreakMeter from './StreakMeter.vue'

/*
 * "Mühürlü test": ONE screen per question. Pick a stamp and, at once and on
 * the same screen, the right one is sealed (green-honey) and your own pick
 * stays amber with "senin seçimin" and one line of why. No red cross, no shake.
 * The parent owns the order of questions (the mastery engine), grading and the
 * server record; this owns what the learner sees: progress in steps, the
 * in-test streak (halves, never zeroes; shield returns every 5th), a hint
 * allowance, and the quiet difficulty drop after three misses in a row.
 */
const {
  question,
  order,
  picked = null,
  graded = null,
  progress,
  eyebrow = '',
  character,
  hintBudget = 0,
  shield = false,
  showStreak = true,
  explain = true,
  lang,
  nextLabel = 'Sıradaki',
} = defineProps<{
  question: Question | null
  order?: readonly number[] | undefined
  picked?: number | null
  /** Result of an order/text answer (choice is graded here from `picked`). */
  graded?: { correct: boolean } | null
  progress: { done: number; total: number }
  eyebrow?: string
  character: CharacterKey
  hintBudget?: number
  shield?: boolean
  showStreak?: boolean
  /** false = assessment style: no reason line (never used with the server score screens). */
  explain?: boolean
  lang?: { prompt: 'en' | 'tr'; option: 'en' | 'tr' } | undefined
  nextLabel?: string
}>()
const emit = defineEmits<{ answer: [response: number | string | string[], ms: number]; next: []; hint: [] }>()

const streak = createRunStreak({ shield })
const ss = streak.state
const pop = ref(0)
const broke = ref(0)
const wrongRow = ref(0)
const wrongOnThis = ref(0)
const hintsLeft = ref(hintBudget)
const hintStage = ref<0 | 1 | 2>(0)
const lastQ = shallowRef<string | null>(null)
const easier = ref(false)
const cheer = ref('')
const nextBtn = useTemplateRef<{ $el?: HTMLElement }>('nextBtn')

const answered = computed(() => (question?.type === 'choice' ? picked !== null : graded !== null))
const correct = computed(() => (question?.type === 'choice' ? picked === question.answer : graded?.correct === true))

watch(
  () => question?.id,
  (id) => {
    if (id === lastQ.value) return
    lastQ.value = id ?? null
    hintStage.value = 0
    wrongOnThis.value = 0
    // three misses in a row: the next question shows two options, no announcement
    easier.value = nextDifficulty(1, wrongRow.value) < 1
  },
)

/** Visible option indices: hints and the quiet drop leave the right one and one other. */
const visible = computed<number[] | undefined>(() => {
  if (!question || question.type !== 'choice' || answered.value) return undefined
  if (!easier.value && hintStage.value < 2 && !(hintStage.value === 1 && !question.hint)) return undefined
  const others = (order ?? question.options.map((_, i) => i)).filter((i) => i !== question.answer)
  const keep = others[(question.id.length + question.prompt.length) % Math.max(1, others.length)]
  return keep === undefined ? undefined : [question.answer, keep]
})

watch(
  () => (question?.type === 'choice' ? picked : graded),
  (now, before) => {
    if (!question || now === null || now === undefined || before !== null && before !== undefined) return
    if (correct.value) {
      wrongRow.value = 0
      const ev = streak.correct()
      if (ev === 'milestone') {
        pop.value++
        playSound('kutlama-kucuk')
      }
      cheer.value = ev === 'milestone' ? `${ss.streak} üst üste! Seri çarpanın ×${ss.multiplier}.` : 'Doğru! Harika gidiyorsun.'
    } else {
      wrongRow.value++
      wrongOnThis.value++
      const ev = streak.wrong()
      if (ev === 'halved' || ev === 'shield-used') {
        broke.value++
        playSound('seri-pof')
      }
      cheer.value = wrongRow.value >= 3 ? 'Hadi biraz daha rahat ısınalım, bir sonraki soru daha kolay.' : 'Yaklaştın!'
    }
    void nextTick(() => nextBtn.value?.$el?.focus())
  },
)

const reasonLine = computed(() => {
  if (!question || !explain || correct.value) return null
  const right = question.type === 'choice' ? question.options[question.answer] : null
  return question.explain ?? (right ? `Doğrusu: ${right}` : null)
})
const stage = computed(() => wrongStage(wrongOnThis.value))
const hintText = computed(() => (hintStage.value >= 1 && question?.hint ? question.hint : null))
const canHint = computed(() => !answered.value && hintsLeft.value > 0 && hintStage.value < 2 && !!question && question.type === 'choice')

function useHint() {
  if (!canHint.value) return
  hintsLeft.value--
  hintStage.value = (hintStage.value + 1) as 1 | 2
  playSound('pop')
  emit('hint')
}
const pct = computed(() => (progress.total ? Math.round((progress.done / progress.total) * 100) : 0))
</script>

<template>
  <section class="flex flex-col gap-4" aria-label="Mühürlü test">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p v-if="eyebrow" class="type-eyebrow text-ink-soft">{{ eyebrow }}</p>
        <p class="type-task text-ink">{{ stepsOf(progress.total, progress.done) }} tamam</p>
      </div>
      <StreakMeter v-if="showStreak" :streak="ss.streak" :multiplier="ss.multiplier" :shield="ss.shield" :pop="pop" :broke="broke" />
    </div>
    <ProgressBar :value="pct" :max="100" :label="`${stepsOf(progress.total, progress.done)} tamam`" />

    <div v-if="question" class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6">
      <QuestionCard
        :question="question"
        :order="order"
        :picked="picked"
        :locked="answered"
        :hint="hintText"
        :hint-available="false"
        :reason="reasonLine"
        :visible="visible"
        :lang="lang"
        @answer="(r, ms) => emit('answer', r, ms)"
      />

      <div v-if="answered" class="flex items-start gap-3" role="status" aria-live="polite">
        <LuguMascot :character="character" :expression="correct ? 'happy' : 'thinking'" :size="56" />
        <div class="type-body text-ink min-w-0 flex-1">
          <p class="flex items-center gap-2 font-bold">
            <CircleCheck v-if="correct" :size="20" class="text-positive shrink-0" aria-hidden="true" />
            <Lightbulb v-else :size="20" class="text-warning-ink shrink-0" aria-hidden="true" />
            {{ cheer }}
          </p>
          <p v-if="!correct && stage === 'piko-help'" class="mt-1">Çoğu kişi buna takılır. Birazdan bir daha göreceksin.</p>
          <p v-else-if="!correct && stage === 'reveal-and-requeue'" class="mt-1">Doğrusunu gördün. Bu soru birazdan bir daha gelecek.</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <BaseButton ref="nextBtn" size="lg" :disabled="!answered" @click="emit('next')">{{ nextLabel }}</BaseButton>
        <BaseButton v-if="canHint" variant="quiet" @click="useHint"><Lightbulb :size="20" aria-hidden="true" /> İpucu ({{ hintsLeft }})</BaseButton>
      </div>
    </div>
    <slot />
  </section>
</template>
