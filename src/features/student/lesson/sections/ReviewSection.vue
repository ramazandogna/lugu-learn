<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'

import { CandyButton, CharacterBubble } from '@/design'
import type { Question, TimeEscapeSlots } from '@/domain/content'
import * as api from '@/lib/api/student'
import type { ReviewItem } from '@/lib/database.types'
import type { Run } from '@/play/attempts'
import type { ResolvedPlay } from '@/play/resolve-play'

import RunResults from '../../play/RunResults.vue'
import StampQuiz from '../../play/StampQuiz.vue'
import TimeEscape from '../../play/TimeEscape.vue'
import { composeResults, loadHistory, type LocalRow } from '../../play/results'
import type { TimedQ } from '../../play/types'
import { toJson, useLesson } from '../context'
import { allAttempted, attempt, restorePractice } from '../practice'

/*
 * A short warm-up on earlier lessons, on the stamp-quiz template (or, when the
 * lesson asks for it and enough is known, a timed round). Optional: it never
 * blocks the lesson.
 */
const { snapshot, completed = false, play } = defineProps<{ snapshot?: unknown; completed?: boolean; play?: ResolvedPlay }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()

/* Package review questions, then the student's weak words from earlier lessons (EN → pick TR). */
const reviewWords = shallowRef<Map<string, ReviewItem>>(new Map())
const questions = shallowRef<Question[]>([...ctx.pkg.review.questions])
const ids = computed(() => questions.value.map((q) => q.id))

function wordQuestion(item: ReviewItem, all: readonly string[]): Question {
  const distractors = all.filter((t) => t.toLowerCase() !== item.tr.toLowerCase())
  const picked = [...new Set(distractors)].sort(() => ctx.rng() - 0.5).slice(0, 3)
  const options = [item.tr, ...picked].sort(() => ctx.rng() - 0.5)
  return { id: `word-${item.package_id}-${item.item_id}`, type: 'choice', prompt: item.en, options, answer: options.indexOf(item.tr) }
}

const st = ref(restorePractice(snapshot, ids.value, questions.value.length))
onMounted(async () => {
  if (completed) return
  try {
    const items = await api.reviewItems(ctx.lessonId)
    const pool = [...items.map((i) => i.tr), ...ctx.pkg.vocabulary.map((v) => v.tr)]
    const words = items.map((i) => wordQuestion(i, pool)).filter((q) => q.type === 'choice' && q.options.length >= 2)
    reviewWords.value = new Map(words.map((q, i) => [q.id, items[i]!]))
    questions.value = [...ctx.pkg.review.questions, ...words]
    st.value = restorePractice(snapshot, ids.value, questions.value.length)
  } catch {
    // Review words are a bonus; the package questions still work without them.
  }
})

const q = computed(() => questions.value[st.value.index])
const picked = ref<number | null>(null)
const graded = ref<{ correct: boolean } | null>(null)
const hintUsed = ref(false)
const rows = ref<LocalRow[]>([])
const earlier = ref<Run[]>([])
const phase = ref<'quiz' | 'results' | 'timed'>('quiz')
const data = computed(() => composeResults(rows.value, earlier.value))
const labelOf = (id: string) => {
  const t = questions.value.find((x) => x.id === id)?.prompt ?? id
  return t.length > 40 ? `${t.slice(0, 38)}…` : t
}

/** One answer to the server and to this run's log. */
function record(cur: Question, response: number | string | string[], ms: number, hinted: boolean, correct: boolean) {
  const word = reviewWords.value.get(cur.id)
  if (word && cur.type === 'choice' && typeof response === 'number') {
    const chosen = cur.options[response] ?? ''
    void api
      .recordReviewAnswer(ctx.sessionId, { packageId: word.package_id, itemId: word.item_id, chosen, responseMs: ms, clientId: crypto.randomUUID() })
      .catch((e: unknown) => ctx.report(e))
  } else {
    void ctx.recordAnswer({ section: 'review', questionId: cur.id, response: toJson(response), responseMs: ms, hintUsed: hinted })
  }
  rows.value.push({ sessionId: ctx.sessionId, packageId: ctx.packageId, section: 'review', questionId: cur.id, correct, responseMs: ms, hintUsed: hinted })
}

function answer(response: number | string | string[], ms: number) {
  const cur = q.value
  if (!cur) return
  const r = attempt(st.value, cur, response)
  if (cur.type === 'choice' && typeof response === 'number') picked.value = response
  else graded.value = { correct: r.correct }
  record(cur, response, ms, hintUsed.value, r.correct)
  emit('state', st.value)
}

async function finishRun() {
  phase.value = 'results'
  earlier.value = await loadHistory(ctx.packageId, 'review', ctx.sessionId)
}

function next() {
  picked.value = null
  graded.value = null
  hintUsed.value = false
  if (st.value.index + 1 < questions.value.length) {
    st.value = { ...st.value, index: st.value.index + 1 }
    emit('state', st.value)
  } else void finishRun()
}

function again() {
  rows.value = []
  picked.value = null
  graded.value = null
  st.value = { ...st.value, index: 0 }
  phase.value = 'quiz'
}

/* timed variant: only choice questions the learner has met before */
const timedSlots = computed(() => (play?.template === 'time-escape' ? (play.slots as TimeEscapeSlots | undefined) : undefined))
const timedPool = computed<Question[]>(() => {
  const ref = timedSlots.value?.pool
  return questions.value.filter((x) => x.type === 'choice' && (reviewWords.value.has(x.id) || !ref || ref.includes(x.id)))
})
const useTimed = computed(() => !!timedSlots.value?.chase && timedPool.value.length >= 3)
const timedQs = computed<TimedQ[]>(() =>
  timedPool.value.flatMap((x) => (x.type === 'choice' ? [{ id: x.id, prompt: x.prompt, options: x.options, answer: x.answer }] : [])),
)
function timedAnswer(tq: TimedQ, i: number, ms: number) {
  const full = questions.value.find((x) => x.id === tq.id)
  if (!full) return
  const r = attempt(st.value, full, i)
  record(full, i, ms, false, r.correct)
  emit('state', st.value)
}
const finished = computed(() => completed || allAttempted(st.value, ids.value))
</script>

<template>
  <div class="flex flex-col gap-4">
    <CharacterBubble character="momo" size="sm">Önceki derslerden birkaç soruyla ısınalım. İstersen bu bölümü atlayabilirsin.</CharacterBubble>

    <TimeEscape
      v-if="useTimed && timedSlots?.chase && phase !== 'results'"
      :questions="timedQs"
      :chase="timedSlots.chase"
      :easy-default="timedSlots.easyDefault ?? false"
      @answered="timedAnswer"
      @finish="emit('complete')"
    />
    <template v-else-if="phase === 'results'">
      <RunResults v-if="data" :data="data" :label-of="labelOf" title="Isınma bitti" character="momo" continue-label="Isınmayı bitir" @again="again" @continue="emit('complete')" />
      <CandyButton v-else class="self-start" @click="emit('complete')">Isınmayı bitir</CandyButton>
    </template>
    <StampQuiz
      v-else-if="q"
      :question="q"
      :picked="picked"
      :graded="graded"
      :progress="{ done: st.index + (picked !== null || graded ? 1 : 0), total: questions.length }"
      eyebrow="Isınma"
      character="momo"
      :hint-budget="play?.hintBudget ?? 2"
      :show-streak="true"
      :next-label="st.index + 1 < questions.length ? 'Sonraki soru' : 'Isınmayı bitir'"
      @answer="answer"
      @next="next"
      @hint="hintUsed = true"
    />
    <CandyButton v-if="finished && phase === 'quiz' && !q" class="self-start" @click="emit('complete')">Isınmayı bitir</CandyButton>
  </div>
</template>
