<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton } from 'rei-kit'

import { CharacterBubble } from '@/design'

import AnswerFeedback from '../components/AnswerFeedback.vue'
import PracticeQuestion from '../components/PracticeQuestion.vue'
import { toJson, useLesson } from '../context'
import { allAttempted, attempt, restorePractice } from '../practice'

/* A short warm-up on earlier lessons. Optional: it never blocks the lesson. */
const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()
const questions = ctx.pkg.review.questions
const ids = questions.map((q) => q.id)

const st = ref(restorePractice(snapshot, ids, questions.length))
const q = computed(() => questions[st.value.index])
const result = ref<{ correct: boolean } | null>(null)
const hint = ref<string | null>(null)
const finished = computed(() => completed || allAttempted(st.value, ids))

function answer(response: number | string | string[], ms: number) {
  if (!q.value) return
  result.value = attempt(st.value, q.value, response)
  void ctx.recordAnswer({ section: 'review', questionId: q.value.id, response: toJson(response), responseMs: ms, hintUsed: hint.value !== null })
  hint.value = null
  emit('state', st.value)
}

function next() {
  if (st.value.index + 1 < questions.length) {
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
