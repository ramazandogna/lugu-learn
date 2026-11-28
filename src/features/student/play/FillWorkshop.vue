<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { BaseButton } from 'rei-kit'
import { BedDouble, Bell, BookOpen, CalendarDays, Clock, Flag, FlaskConical, Lamp, Library, Map, Microscope, Moon, NotebookPen, Pen, Presentation, Sparkles, Star, Sun, Trophy, type LucideIcon } from 'lucide-vue-next'

import { CandyButton, HintBubble, LuguMascot, playSound } from '@/design'
import type { CharacterKey, FillWorkshopSlots, Question } from '@/domain/content'
import { createFillWorkshop } from '@/play/fill-workshop'

import PracticeQuestion from '../lesson/components/PracticeQuestion.vue'
import SpeakButton from './SpeakButton.vue'

/*
 * "Tık Tezgâhı". Tap a piece, tap a gap: it sits with a tick and a small pop.
 * (Dragging is not needed; tapping is the way in.) "Kontrol et" grades with the
 * lesson's own rules. A wrong sentence is never an error: the pieces fade back
 * to the tray in 300 ms, one line says why. A right one comes alive: the whole
 * sentence glows, Piko reads it, the scene object wiggles. The answer goes to
 * the parent once the learner moves on (right) or at once (wrong); grading and
 * saving stay with the lesson's engine, so the server score does not change.
 */
type Item = FillWorkshopSlots['items'][number]
const { question, sceneObject, onComplete, hint = null, hintAvailable = false, character } = defineProps<{
  question: Question
  sceneObject?: string | undefined
  onComplete?: Item['onComplete'] | undefined
  hint?: string | null
  hintAvailable?: boolean
  character: CharacterKey
}>()
const emit = defineEmits<{ answer: [response: number | string | string[], ms: number]; hint: [] }>()

const ICONS: Record<string, LucideIcon> = {
  clock: Clock, sun: Sun, moon: Moon, book: BookOpen, star: Star, bed: BedDouble,
  'school-bell': Bell, whiteboard: Presentation, trophy: Trophy, 'school-flag': Flag, notebook: NotebookPen, 'diary-page': NotebookPen,
  'library-shelf': Library, microscope: Microscope, beaker: FlaskConical, 'lab-table': FlaskConical, pen: Pen, 'desk-lamp': Lamp,
  'night-lamp': Lamp, 'wall-calendar': CalendarDays, 'study-planner': CalendarDays, 'school-map': Map,
}
const Icon = computed(() => ICONS[sceneObject ?? ''] ?? Sparkles)

const fw = shallowRef(question.type === 'text' ? null : createFillWorkshop(question))
const why = ref<string | null>(null)
const celebrating = ref(false)
const held = ref<{ response: number | string | string[]; ms: number } | null>(null)
let shownAt = Date.now()
watch(
  () => question.id,
  () => {
    fw.value = question.type === 'text' ? null : createFillWorkshop(question)
    why.value = null
    celebrating.value = false
    held.value = null
    shownAt = Date.now()
  },
)

const state = computed(() => fw.value?.state)
const pool = computed(() => (fw.value && state.value ? (void state.value.slots, fw.value.pool()) : []))
const textOf = (id: number | null) => (id === null ? '' : (state.value?.chips.find((c) => c.id === id)?.text ?? ''))

/** A choice question may carry its gap inside the prompt: "She ___ up at seven." */
const parts = computed(() => (question.type === 'choice' ? question.prompt.split(/_{2,}/) : [question.prompt]))
const inline = computed(() => question.type === 'choice' && parts.value.length === 2)
const sentence = computed(() => {
  if (!state.value) return ''
  if (question.type === 'order') return state.value.slots.map(textOf).join(' ')
  const t = textOf(state.value.slots[0] ?? null)
  return inline.value ? `${parts.value[0]}${t}${parts.value[1]}`.replace(/\s+/g, ' ').trim() : t
})

function pickChip(id: number) {
  const f = fw.value
  if (!f || celebrating.value) return
  if (f.state.selected === id) {
    const free = f.state.slots.findIndex((s) => s === null)
    if (free >= 0 && f.place(free, id)) playSound('tik')
    return
  }
  f.select(id)
}
function tapSlot(i: number) {
  const f = fw.value
  if (!f || celebrating.value) return
  if (f.state.selected !== null) {
    if (f.place(i)) playSound('tik')
  } else if (f.state.slots[i] !== null) f.remove(i)
}

function check() {
  const f = fw.value
  if (!f || !f.isFull()) return
  const response = f.response()
  const ms = Date.now() - shownAt
  if (response === null) return
  const r = f.check()
  if (r.correct) {
    why.value = null
    celebrating.value = true
    held.value = { response, ms }
    playSound(onComplete?.sfx === 'kutlama-kucuk' ? 'kutlama-kucuk' : 'muhur')
  } else {
    why.value = r.why ?? 'Bir daha bakalım, parçaları başka yere koyabilirsin.'
    playSound('yanlis-yumusak')
    emit('answer', response, ms)
    shownAt = Date.now()
  }
}
function next() {
  if (held.value) emit('answer', held.value.response, held.value.ms)
}
</script>

<template>
  <div v-if="!fw" class="flex flex-col gap-4">
    <PracticeQuestion :question="question" :hint="hint" :hint-available="hintAvailable" @answer="(r, ms) => emit('answer', r, ms)" @hint="emit('hint')" />
  </div>

  <section v-else class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6" aria-label="Cümle atölyesi">
    <p v-if="!inline" class="type-task text-ink">{{ question.prompt }}</p>

    <!-- the sentence tray -->
    <div class="rounded-tile bg-wash border-hair flex min-h-24 flex-wrap items-center gap-2 border-2 border-dashed p-3" :class="celebrating ? 'animate-glow border-solid' : ''">
      <template v-if="inline">
        <span class="type-title text-ink" lang="en">{{ parts[0] }}</span>
      </template>
      <button
        v-for="(chipId, i) in state!.slots"
        :key="i"
        type="button"
        class="focus-ring rounded-control type-task text-ink min-h-12 min-w-20 border-2 px-3 py-2 font-bold"
        :class="chipId === null ? 'border-field-edge bg-surface border-dashed' : 'chip-placed border-primary bg-wash'"
        :aria-label="chipId === null ? `boşluk ${i + 1}` : `boşluk ${i + 1}: ${textOf(chipId)}. Geri almak için dokun.`"
        :disabled="celebrating"
        @click="tapSlot(i)"
      >
        <span v-if="chipId !== null" :key="chipId" class="animate-land inline-block" lang="en">{{ textOf(chipId) }}</span>
        <span v-else class="text-ink-soft" aria-hidden="true">{{ state!.selected !== null ? 'buraya' : '___' }}</span>
      </button>
      <template v-if="inline">
        <span class="type-title text-ink" lang="en">{{ parts[1] }}</span>
      </template>
    </div>

    <!-- the tray of pieces -->
    <div v-if="!celebrating" class="flex flex-wrap gap-2" role="group" aria-label="Parçalar">
      <button
        v-for="c in pool"
        :key="c.id"
        type="button"
        class="control btn-press focus-ring rounded-control type-task text-ink min-h-12 min-w-14 px-4 py-2 font-bold"
        :class="[state!.selected === c.id ? 'border-primary bg-wash is-picked' : '', state!.returned.includes(c.id) ? 'animate-return' : '']"
        :aria-pressed="state!.selected === c.id"
        lang="en"
        @click="pickChip(c.id)"
      >
        {{ c.text }}
      </button>
      <p v-if="!pool.length" class="type-small text-ink-soft">Bütün parçalar yerinde. Kontrol edebilirsin.</p>
    </div>
    <p v-if="!celebrating" class="type-small text-ink-soft">Bir parçaya dokun, sonra boşluğa dokun. Aynı parçaya iki kez dokunursan ilk boşluğa oturur.</p>

    <HintBubble v-if="hint" :closable="false">{{ hint }}</HintBubble>
    <p v-if="why" class="type-body text-ink" role="status"><span class="font-bold">Yaklaştın!</span> {{ why }}</p>

    <!-- the sentence comes alive -->
    <div v-if="celebrating" class="flex flex-wrap items-center gap-3" role="status">
      <span :class="onComplete?.anim === 'object-wiggle' ? 'animate-wiggle' : 'animate-stamp'" class="text-primary grid size-14 place-items-center">
        <component :is="Icon" :size="32" aria-hidden="true" />
      </span>
      <LuguMascot :character="character" expression="celebrating" :size="64" animated />
      <p class="type-title text-ink min-w-0 flex-1" lang="en">{{ sentence }}</p>
      <SpeakButton :text="sentence" label="Piko okusun" />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <CandyButton v-if="!celebrating" :disabled="!fw.isFull()" disabled-reason="Önce boşlukları doldur" @click="check">Kontrol et</CandyButton>
      <CandyButton v-else @click="next">Sonraki</CandyButton>
      <BaseButton v-if="hintAvailable && !hint && !celebrating" variant="quiet" @click="emit('hint')">İpucu göster</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.animate-land {
  animation: fw-land 180ms var(--ease-pop) both;
}
.animate-return {
  animation: fw-return 300ms var(--ease-standard) both;
}
.animate-glow {
  animation: fw-glow var(--duration-celebrate, 900ms) var(--ease-standard) 1 both;
}
.animate-wiggle {
  animation: fw-wiggle 700ms ease-in-out 2;
}
@keyframes fw-land {
  from {
    transform: scale(0.7);
    opacity: 0.4;
  }
}
@keyframes fw-return {
  from {
    opacity: 0.25;
    transform: translateY(-6px);
  }
}
@keyframes fw-glow {
  from {
    box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-star) 70%, transparent);
  }
  60% {
    box-shadow: 0 0 0 12px color-mix(in oklab, var(--color-star) 0%, transparent);
  }
}
@keyframes fw-wiggle {
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}
</style>
