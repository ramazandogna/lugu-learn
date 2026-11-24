<script setup lang="ts">
import { computed, ref } from 'vue'

import { CharacterBubble } from '@/design'
import type { TapGuideSlots } from '@/domain/content'
import type { ResolvedPlay } from '@/play/resolve-play'

import QuestionCard from '../../play/QuestionCard.vue'
import ScrollStory from '../../play/ScrollStory.vue'
import TapGuide from '../../play/TapGuide.vue'
import type { GuideView, StoryStepView } from '../../play/types'
import { toJson, useLesson } from '../context'
import { allAttempted, attempt, boldSegments, restorePractice } from '../practice'

/*
 * Short steps, one idea each, told on the pinned stage: a sentence at a time
 * (key words underlined), then the examples, then a quick check as the gate to
 * the next step. After the steps, with the tap-guide template, "bana tıkla"
 * hints and the tap / don't-tap round. Practice: hints and explanations allowed.
 */
const { snapshot, completed = false, play } = defineProps<{ snapshot?: unknown; completed?: boolean; play?: ResolvedPlay }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()
const exSteps = ctx.pkg.explanation.steps
const checkIds = exSteps.flatMap((s) => (s.check ? [s.check.id] : []))
const slots = (play?.template === 'tap-guide' ? play.slots : undefined) as TapGuideSlots | undefined

const st = ref(restorePractice(snapshot, checkIds, exSteps.length))

/* flatten: sentences of the body, then examples, then the check gate */
const flat: { step: number; view: StoryStepView }[] = exSteps.flatMap((s, si) => {
  const out: { step: number; view: StoryStepView }[] = []
  const sentences = s.body.split(/(?<=[.!?])\s+/).filter(Boolean)
  sentences.forEach((sentence, i) => {
    const segs = boldSegments(sentence)
    out.push({
      step: si,
      view: {
        id: `${s.id}-s${i}`,
        speaker: 'piko',
        en: segs.map((g) => g.text).join(''),
        title: `${s.title} · Adım ${si + 1} / ${exSteps.length}`,
        emphasis: segs.filter((g) => g.bold).map((g) => g.text).slice(0, 2),
        lang: 'tr',
      },
    })
  })
  s.examples.forEach((ex, i) => out.push({ step: si, view: { id: `${s.id}-e${i}`, speaker: 'piko', en: ex.en, tr: ex.tr, title: 'Örnek', lang: 'en' } }))
  if (s.check) out.push({ step: si, view: { id: `${s.id}-c`, speaker: 'piko', en: 'Şimdi sıra sende!', tr: 'Kısa bir kontrol.', title: s.title, gate: s.check.id, lang: 'tr' } })
  return out
})
const steps = flat.map((f) => f.view)
const startAt = Math.max(0, flat.findIndex((f) => f.step === st.value.index))
const presolved = checkIds.filter((id) => (st.value.answered[id]?.attempts ?? 0) > 0)
const checkOf = (gate: string) => exSteps.find((s) => s.check?.id === gate)?.check

/* gate state */
const picked = ref<Record<string, number>>({})
const graded = ref<Record<string, { correct: boolean }>>({})
const hints = ref<Record<string, string>>({})
const hintUsed = ref<Record<string, boolean>>({})
const wrongNote = ref<Record<string, string>>({})

function answer(gate: string, response: number | string | string[], ms: number, pass: (ok: boolean) => string | undefined) {
  const q = checkOf(gate)
  if (!q) return
  const r = attempt(st.value, q, response)
  void ctx.recordAnswer({ section: 'explanation', questionId: q.id, response: toJson(response), responseMs: ms, hintUsed: hintUsed.value[gate] === true })
  if (q.type === 'choice' && typeof response === 'number') {
    picked.value = { ...picked.value, [gate]: response }
    pass(true)
  } else {
    graded.value = { ...graded.value, [gate]: { correct: r.correct } }
    const out = pass(r.correct)
    if (!r.correct) wrongNote.value = { ...wrongNote.value, [gate]: out === 'explain-and-pass' ? (q.explain ?? 'Hadi birlikte bakalım, sonra devam ederiz.') : 'Yaklaştın! Bir daha deneyelim.' }
    else wrongNote.value = { ...wrongNote.value, [gate]: '' }
  }
  emit('state', st.value)
}
function showHint(gate: string) {
  const q = checkOf(gate)
  if (!q?.hint) return
  hints.value = { ...hints.value, [gate]: q.hint }
  hintUsed.value = { ...hintUsed.value, [gate]: true }
}
function onStep(i: number) {
  st.value = { ...st.value, index: flat[i]?.step ?? 0 }
  emit('state', st.value)
}

/* "bana tıkla" guides: authored, else the steps' own hints (at most 3) */
const guides = computed<GuideView[]>(() => {
  if (slots?.guides) {
    return slots.guides.map((g) => ({ id: g.id, label: g.target.split(/[-_]/).pop() ?? g.target, hint: g.hint, joke: g.joke }))
  }
  return exSteps
    .filter((s) => s.check?.hint)
    .slice(0, 3)
    .map((s) => ({ id: s.id, label: s.title, hint: { fine: s.check!.hint as string } }))
})
const hasGuide = play?.template === 'tap-guide' && (guides.value.length > 0 || !!slots?.goNoGo)
const phase = ref<'story' | 'guide'>('story')
const finished = computed(() => completed || allAttempted(st.value, checkIds))

function afterStory() {
  if (!finished.value) return
  if (hasGuide) phase.value = 'guide'
  else emit('complete')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <CharacterBubble character="piko" size="sm">Küçük adımlarla ilerleyeceğiz. Dokun ya da ok tuşuna bas, her adımda bir fikir açılır.</CharacterBubble>

    <ScrollStory
      v-if="phase === 'story'"
      :steps="steps"
      character="piko"
      :start-index="startAt"
      :presolved="presolved"
      :last-label="hasGuide ? 'Bana tıkla turuna geç' : 'Anladım, devam et'"
      label="Konu anlatımı"
      @step="onStep"
      @finish="afterStory"
    >
      <template #gate="{ step, pass, solved }">
        <template v-for="q in [checkOf(step.gate ?? '')]" :key="step.gate">
          <div v-if="q" class="surface rounded-tile border-hair flex flex-col gap-3 border p-4">
            <QuestionCard
              :question="q"
              :picked="picked[q.id] ?? null"
              :locked="q.type === 'choice' ? picked[q.id] !== undefined : solved && graded[q.id]?.correct === true"
              :hint="hints[q.id] ?? null"
              :hint-available="!!q.hint && !hints[q.id]"
              :reason="q.explain ?? null"
              @answer="(r, ms) => answer(q.id, r, ms, pass)"
              @hint="showHint(q.id)"
            />
            <p v-if="wrongNote[q.id]" class="type-body text-ink" role="status">{{ wrongNote[q.id] }}</p>
          </div>
        </template>
      </template>
    </ScrollStory>

    <TapGuide
      v-else
      :guides="guides"
      :go-no-go="slots?.goNoGo"
      :hint-budget="play?.hintBudget ?? 3"
      character="piko"
      @finish="emit('complete')"
    />
  </div>
</template>
