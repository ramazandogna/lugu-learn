<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { BaseButton } from 'rei-kit'

import { CharacterBubble } from '@/design'
import type { Question } from '@/domain/content'
import * as api from '@/lib/api/student'
import type { ReviewItem } from '@/lib/database.types'

import AnswerFeedback from '../components/AnswerFeedback.vue'
import PracticeQuestion from '../components/PracticeQuestion.vue'
import { toJson, useLesson } from '../context'
import { allAttempted, attempt, restorePractice } from '../practice'

/* A short warm-up on earlier lessons. Optional: it never blocks the lesson. */
const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean }>()
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
const result = ref<{ correct: boolean } | null>(null)
const hint = ref<string | null>(null)
const finished = computed(() => completed || allAttempted(st.value, ids.value))

function answer(response: number | string | string[], ms: number) {
  const cur = q.value
  if (!cur) return
  result.value = attempt(st.value, cur, response)
  const word = reviewWords.value.get(cur.id)
  if (word && cur.type === 'choice' && typeof response === 'number') {
    const chosen = cur.options[response] ?? ''
    void api
      .recordReviewAnswer(ctx.sessionId, { packageId: word.package_id, itemId: word.item_id, chosen, responseMs: ms, clientId: crypto.randomUUID() })
      .catch((e: unknown) => ctx.report(e))
  } else {
    void ctx.recordAnswer({ section: 'review', questionId: cur.id, response: toJson(response), responseMs: ms, hintUsed: hint.value !== null })
  }
  hint.value = null
  emit('state', st.value)
}

function next() {
  if (st.value.index + 1 < questions.value.length) {
    st.value = { ...st.value, index: st.value.index + 1 }
    result.value = null
    emit('state', st.value)
  } else emit('complete')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <CharacterBubble character="momo" size="sm">Önceki derslerden birkaç soruyla ısınalım. İstersen bu bölümü atlayabilirsin.</CharacterBubble>
    <template v-if="q">
      <p class="text-ink-soft text-sm">Soru {{ st.index + 1 }} / {{ questions.length }}</p>
      <PracticeQuestion :question="q" :hint="hint" :hint-available="!!q.hint" @answer="answer" @hint="hint = q.hint ?? null" />
      <AnswerFeedback v-if="result" :correct="result.correct" character="momo" :explain="q.explain" />
      <BaseButton v-if="result || finished" class="self-start" @click="next">{{ st.index + 1 < questions.length ? 'Sonraki soru' : 'Isınmayı bitir' }}</BaseButton>
    </template>
  </div>
</template>
