<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'

import { CharacterBubble } from '@/design'

import AnswerFeedback from '../components/AnswerFeedback.vue'
import PracticeQuestion from '../components/PracticeQuestion.vue'
import { toJson, useLesson } from '../context'
import { allAttempted, attempt, boldSegments, restorePractice } from '../practice'

/* Short steps, one idea each, with examples and a quick check (practice: hints and explanations allowed). */
const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()
const steps = ctx.pkg.explanation.steps
const checkIds = steps.flatMap((s) => (s.check ? [s.check.id] : []))

const st = ref(restorePractice(snapshot, checkIds, steps.length))
const step = computed(() => steps[st.value.index]!)
const result = ref<{ correct: boolean } | null>(null)
const hint = ref<string | null>(null)
const hintUsed = ref(false)
const checkDone = computed(() => !step.value.check || (st.value.answered[step.value.check.id]?.attempts ?? 0) > 0)
const finished = computed(() => completed || allAttempted(st.value, checkIds))

const save = () => emit('state', st.value)

function answer(response: number | string | string[], ms: number) {
  const q = step.value.check
  if (!q) return
  result.value = attempt(st.value, q, response)
  void ctx.recordAnswer({ section: 'explanation', questionId: q.id, response: toJson(response), responseMs: ms, hintUsed: hintUsed.value })
  hint.value = null
  hintUsed.value = false
  save()
}

function showHint() {
  hint.value = step.value.check?.hint ?? null
  hintUsed.value = true
}

function goTo(i: number) {
  st.value = { ...st.value, index: Math.max(0, Math.min(steps.length - 1, i)) }
  result.value = null
  hint.value = null
  hintUsed.value = false
  save()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ProgressBar :value="st.index + 1" :max="steps.length" :label="`Adım ${st.index + 1} / ${steps.length}`" />
    <article class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
      <p class="type-eyebrow text-ink-soft">Adım {{ st.index + 1 }} / {{ steps.length }}</p>
      <h3 class="type-section text-ink">{{ step.title }}</h3>
      <p class="text-ink">
        <template v-for="(seg, i) in boldSegments(step.body)" :key="i"><strong v-if="seg.bold">{{ seg.text }}</strong><template v-else>{{ seg.text }}</template></template>
      </p>
      <ul v-if="step.examples.length" class="flex flex-col gap-2">
        <li v-for="(ex, i) in step.examples" :key="i" class="rounded-tile bg-wash p-3">
          <span class="text-ink block font-bold" lang="en">{{ ex.en }}</span>
          <span class="text-ink-soft type-small">{{ ex.tr }}</span>
        </li>
      </ul>
    </article>

    <template v-if="step.check">
      <CharacterBubble character="piko" size="sm">Hadi kısa bir kontrol yapalım!</CharacterBubble>
      <PracticeQuestion :question="step.check" :hint="hint" :hint-available="!!step.check.hint" @answer="answer" @hint="showHint" />
      <AnswerFeedback v-if="result" :correct="result.correct" character="piko" :explain="step.check.explain" />
    </template>

    <div class="flex flex-wrap justify-between gap-2">
      <BaseButton variant="secondary" :disabled="st.index === 0" @click="goTo(st.index - 1)">Önceki adım</BaseButton>
      <BaseButton v-if="st.index < steps.length - 1" :disabled="!checkDone" @click="goTo(st.index + 1)">Sonraki adım</BaseButton>
      <BaseButton v-else :disabled="!finished || !checkDone" @click="emit('complete')">Anladım, devam et</BaseButton>
    </div>
    <p v-if="!checkDone" class="text-ink-soft type-small">Devam etmeden önce kontrol sorusunu cevapla.</p>
  </div>
</template>
