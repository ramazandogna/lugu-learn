<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { BaseButton } from 'rei-kit'

import { CharacterBubble } from '@/design'
import type { Question, StampQuizSlots, TimeEscapeSlots } from '@/domain/content'
import { MASTERY } from '@/engine/mastery'
import { answerVocab, buildVocabQuestion, currentDirection, isVocabQuizDone, nextVocabQuestion, restoreVocabQuiz, snapshotVocabQuiz, startVocabQuiz, vocabQuizProgress } from '@/engine/vocab-quiz'
import type { ResolvedPlay } from '@/play/resolve-play'
import type { Run } from '@/play/attempts'

import RunResults from '../../play/RunResults.vue'
import StampQuiz from '../../play/StampQuiz.vue'
import TimeEscape from '../../play/TimeEscape.vue'
import { composeResults, loadHistory, type LocalRow } from '../../play/results'
import type { TimedQ } from '../../play/types'
import MasteryList from '../components/MasteryList.vue'
import { useLesson } from '../context'

/*
 * Vocabulary mastery quiz on the stamp-quiz template: two right answers since
 * the last miss per word (engine), one screen per word, the learner's streak,
 * and at the end the comparison with earlier tries. With the time-escape
 * template the same quiz comes first (mastery is what the lesson needs); a
 * quick timed round on the now-known words follows, never instead of it.
 */
const { snapshot, completed = false, play } = defineProps<{ snapshot?: unknown; completed?: boolean; play?: ResolvedPlay }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()

const make = (fresh: boolean) =>
  snapshot && !fresh ? restoreVocabQuiz(snapshot, ctx.pkg, ctx.rng, ctx.preMastered) : startVocabQuiz(ctx.pkg, ctx.rng, fresh ? [] : ctx.preMastered)
const quizRef = shallowRef(make(false))
const version = ref(0)
const shown = ref(0)
const read = <T,>(f: () => T) => computed(() => (void version.value, f()))
let shownAt = Date.now()

const slots = computed(() => (play?.slots ?? {}) as Partial<StampQuizSlots>)
const q = read(() => quizRef.value.state.question)
const picked = read(() => quizRef.value.state.picked)
const done = read(() => isVocabQuizDone(quizRef.value))
const progress = read(() => vocabQuizProgress(quizRef.value))
const direction = read(() => currentDirection(quizRef.value))
const order = read(() => quizRef.value.state.order)
const mastery = read(() => {
  const quiz = quizRef.value
  const pre = new Set(quiz.preMastered)
  return ctx.pkg.vocabulary.map((v) => ({ id: v.id, en: v.en, tr: v.tr, count: pre.has(v.id) ? MASTERY : Math.min(MASTERY, quiz.state.counts.get(v.id) ?? 0) }))
})
const question = read<Question | null>(() => {
  const cur = q.value
  const quiz = quizRef.value
  return cur && quiz.state.current ? { id: `${quiz.state.current}#${shown.value}`, type: 'choice', prompt: cur.prompt, options: cur.options, answer: cur.answer } : null
})
const lang = computed(() => (direction.value === 'en_tr' ? { prompt: 'en' as const, option: 'tr' as const } : { prompt: 'tr' as const, option: 'en' as const }))

const rows = ref<LocalRow[]>([])
const earlier = ref<Run[]>([])
const phase = ref<'quiz' | 'results' | 'timed'>(done.value || completed ? 'results' : 'quiz')
const data = computed(() => composeResults(rows.value, earlier.value))
const wordOf = (id: string) => ctx.pkg.vocabulary.find((v) => v.id === id)?.en ?? id
const timedOn = computed(() => play?.template === 'time-escape' && ctx.pkg.vocabulary.length >= 3)

function bump() {
  version.value++
  emit('state', snapshotVocabQuiz(quizRef.value))
}

function pick(response: number | string | string[]) {
  if (typeof response !== 'number') return
  const quiz = quizRef.value
  const a = answerVocab(quiz, response, ctx.rng)
  if (!a) return
  const ms = Date.now() - shownAt
  void ctx.recordVocab({ itemId: a.vocabId, direction: a.direction, chosen: a.chosenText, responseMs: ms })
  rows.value.push({ sessionId: ctx.sessionId, packageId: ctx.packageId, section: 'vocab_quiz', questionId: a.vocabId, correct: a.outcome.correct, responseMs: ms, hintUsed: false })
  bump()
}

async function finishRun() {
  phase.value = 'results'
  earlier.value = await loadHistory(ctx.packageId, 'vocab_quiz', ctx.sessionId)
}

function next() {
  const more = nextVocabQuestion(quizRef.value, ctx.rng)
  shown.value++
  shownAt = Date.now()
  bump()
  if (!more) void finishRun()
}

function again() {
  quizRef.value = make(true)
  rows.value = []
  shown.value++
  shownAt = Date.now()
  phase.value = 'quiz'
  bump()
}

/* optional timed round over the words the learner now knows */
const timedSlots = computed(() => (play?.slots ?? undefined) as TimeEscapeSlots | undefined)
const timedQs = computed<TimedQ[]>(() => {
  const all = ctx.pkg.vocabulary
  const ref = timedSlots.value?.pool
  const items = ref ? all.filter((v) => ref.includes(v.id)) : all
  return items.map((v) => {
    const bq = buildVocabQuestion(v, all, 'en_tr', ctx.rng)
    return { id: v.id, prompt: bq.prompt, options: bq.options, answer: bq.answer, lang: { prompt: 'en' as const, option: 'tr' as const } }
  })
})
function timedAnswer(tq: TimedQ, i: number, ms: number) {
  void ctx.recordVocab({ itemId: tq.id, direction: 'en_tr', chosen: tq.options[i] ?? '', responseMs: ms })
}
function afterResults() {
  if (timedOn.value && timedQs.value.length >= 3) phase.value = 'timed'
  else emit('complete')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <CharacterBubble character="sasha" size="sm">Her kelimeyi art arda iki kez doğru bilince o kelimeyi öğrenmiş olursun. Takılırsan sorun değil, kelime tekrar gelir!</CharacterBubble>

    <TimeEscape
      v-if="phase === 'timed' && timedSlots?.chase"
      :questions="timedQs"
      :chase="timedSlots.chase"
      :easy-default="timedSlots.easyDefault ?? false"
      @answered="timedAnswer"
      @finish="emit('complete')"
    />

    <template v-else-if="phase === 'results'">
      <RunResults v-if="data" :data="data" :label-of="wordOf" title="Kelime oyunu bitti" :character="ctx.character" :continue-label="timedOn ? 'Hızlı tura geç' : 'Devam et'" @again="again" @continue="afterResults" />
      <div v-else class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
        <p class="type-section text-ink">Tüm kelimeleri öğrendin!</p>
        <div class="flex flex-wrap gap-2">
          <BaseButton size="lg" @click="emit('complete')">Devam et</BaseButton>
          <BaseButton variant="secondary" @click="again">Tekrar çöz</BaseButton>
        </div>
      </div>
      <MasteryList :items="mastery" :goal="MASTERY" />
    </template>

    <StampQuiz
      v-else
      :question="question"
      :order="order"
      :picked="picked"
      :progress="{ done: progress.mastered, total: progress.total }"
      eyebrow="Kelime oyunu"
      character="sasha"
      :hint-budget="play?.hintBudget ?? 2"
      :shield="slots.shield ?? true"
      :show-streak="slots.showStreak ?? true"
      :lang="lang"
      @answer="pick"
      @next="next"
    >
      <MasteryList :items="mastery" :goal="MASTERY" />
    </StampQuiz>
  </div>
</template>
