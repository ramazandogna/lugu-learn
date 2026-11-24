<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, BaseInput } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'

import { CharacterBubble } from '@/design'
import {
  chooseOption,
  currentView,
  goTo,
  restoreAssessment,
  setOrderAnswer,
  setText,
  snapshotAssessment,
  startAssessment,
  submission,
  submitAssessment,
  unansweredList,
} from '@/engine/assessment'
import type { OrderState } from '@/engine/order'
import type { AssessmentScore } from '@/lib/database.types'

import AssessmentResult from '../components/AssessmentResult.vue'
import OrderBoard from '../components/OrderBoard.vue'
import { useLesson } from '../context'

/* The final check: no hints, answers changeable until submit, the score comes from the server. */
const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()

const saved = (snapshot ?? {}) as { sitting?: unknown; score?: AssessmentScore | null }
const sitting = saved.sitting ? restoreAssessment(saved.sitting, ctx.pkg.assessment, ctx.rng, Date.now()) : startAssessment(ctx.pkg.assessment, ctx.rng, Date.now())
const score = ref<AssessmentScore | null>(saved.score ?? null)
const version = ref(0)
const read = <T,>(f: () => T) => computed(() => (void version.value, f()))

const view = read(() => currentView(sitting))
const index = read(() => sitting.exam.current)
const total = sitting.views.length
const unanswered = read(() => unansweredList(sitting))
const submitted = read(() => sitting.exam.submitted || score.value !== null || completed)
const confirming = ref(false)
const sending = ref(false)

const choice = read(() => (view.value ? sitting.exam.answers[view.value.id] : undefined))
const text = read(() => (view.value ? (sitting.text[view.value.id] ?? '') : ''))
const order = read(() => (view.value ? sitting.order[view.value.id] : undefined))

function bump() {
  version.value++
  emit('state', { sitting: snapshotAssessment(sitting), score: score.value })
}

const pick = (i: number) => view.value && (chooseOption(sitting, view.value.id, i), bump())
const type = (v: string | number | undefined) => view.value && (setText(sitting, view.value.id, String(v ?? '')), bump())
const arrange = (s: OrderState) => view.value && (setOrderAnswer(sitting, view.value.id, s), bump())
const go = (i: number) => (goTo(sitting, i), bump())

function askSubmit() {
  if (unanswered.value.length) confirming.value = true
  else void send()
}

async function send() {
  confirming.value = false
  sending.value = true
  submitAssessment(sitting)
  bump()
  try {
    score.value = await ctx.submitAssessment(submission(sitting))
    bump()
  } catch (e) {
    ctx.report(e)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <AssessmentResult v-if="score" :score="score" @continue="emit('complete')" />
    <div v-else-if="submitted" class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
      <p class="type-section text-ink">Cevapların gönderildi.</p>
      <p v-if="sending" class="text-ink-soft">Puanın hesaplanıyor…</p>
      <BaseButton v-else class="self-start" @click="emit('complete')">Devam et</BaseButton>
    </div>

    <template v-else-if="view">
      <CharacterBubble character="sasha" size="sm">Son adım! Burada ipucu yok ama acele etme. Cevaplarını göndermeden önce değiştirebilirsin.</CharacterBubble>
      <article v-if="view.part === 'reading'" class="surface rounded-card flex flex-col gap-2 p-4 sm:p-6">
        <h3 class="type-section text-ink" lang="en">{{ sitting.reading.title }}</h3>
        <p v-for="(p, i) in sitting.reading.paragraphs" :key="i" class="text-ink" lang="en">{{ p }}</p>
      </article>
      <div class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6">
        <p class="type-eyebrow text-ink-soft">{{ view.part === 'quiz' ? 'Test' : 'Okuma' }} · Soru {{ index + 1 }} / {{ total }}</p>
        <p class="type-task text-ink" lang="en">{{ view.prompt }}</p>
        <div v-if="view.type === 'choice'" class="grid gap-2" role="group" :aria-label="view.prompt">
          <BaseButton v-for="(o, i) in view.options" :key="i" variant="secondary" :pressed="choice === i" lang="en" @click="pick(i)">{{ o }}</BaseButton>
        </div>
        <BaseInput v-else-if="view.type === 'text'" :model-value="text" label="Cevabın" autocomplete="off" spellcheck="false" @update:model-value="type" />
        <OrderBoard v-else-if="order" :state="order" label="Kelimeleri doğru sıraya koy" @update="arrange" />
      </div>
      <nav class="flex flex-wrap justify-between gap-2" aria-label="Sorular arasında geçiş">
        <BaseButton variant="secondary" :disabled="index === 0" @click="go(index - 1)">Önceki</BaseButton>
        <BaseButton v-if="index < total - 1" @click="go(index + 1)">Sonraki</BaseButton>
        <BaseButton v-else :loading="sending" @click="askSubmit">Cevaplarımı gönder</BaseButton>
      </nav>
      <p class="text-ink-soft type-small">{{ total - unanswered.length }} / {{ total }} soru cevaplandı</p>
    </template>

    <ResponsiveDialog v-model="confirming" title="Boş sorular var" close-label="Kapat">
      <p class="text-ink">{{ unanswered.length }} soruyu boş bıraktın: {{ unanswered.map((u) => `${u.part === 'quiz' ? 'Test' : 'Okuma'} ${u.no}`).join(', ') }}. Boş sorular yanlış sayılır. Yine de göndermek ister misin?</p>
      <template #actions>
        <BaseButton variant="secondary" @click="(confirming = false, go(sitting.views.findIndex((v) => v.id === unanswered[0]?.id)))">Boş sorulara dön</BaseButton>
        <BaseButton @click="send">Yine de gönder</BaseButton>
      </template>
    </ResponsiveDialog>
  </div>
</template>
