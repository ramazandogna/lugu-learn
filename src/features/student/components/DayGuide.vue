<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { X } from 'lucide-vue-next'

import { CandyButton, LuguMascot, playSound, useReducedMotion } from '@/design'

import { WORLDS } from '../inspire/worlds'

/*
 * D2 Piko Rehber: Piko waits at the bottom right. After 8 s of quiet his head
 * turns; a tap opens the day's one suggestion (today's lesson, or a story from
 * the shelf once the lesson is done). One suggestion a day: opening it uses
 * the day up, and "Bugünlük yeter" closes it for good. Never a notification.
 */
const { lesson, doneToday = false } = defineProps<{
  /** The lesson the learner is on, if any. */
  lesson: { id: string; title: string; in_progress: boolean } | null
  /** Today already counts for the chain. */
  doneToday?: boolean
}>()

const KEY = 'lugu.guide.day'
const reduced = useReducedMotion()
const today = new Date().toLocaleDateString('sv-SE')
const used = ref(false)
try {
  used.value = localStorage.getItem(KEY) === today
} catch {
  /* no storage: the guide just shows */
}
const open = ref(false)
const looking = ref(false)
let idle: ReturnType<typeof setTimeout> | undefined
const arm = () => {
  looking.value = false
  clearTimeout(idle)
  if (!reduced.value && !open.value) idle = setTimeout(() => (looking.value = true), 8000)
}
onMounted(() => {
  arm()
  window.addEventListener('pointerdown', arm, { passive: true })
})
onBeforeUnmount(() => {
  clearTimeout(idle)
  window.removeEventListener('pointerdown', arm)
})

const world = computed(() => WORLDS[Math.floor(Date.now() / 86_400_000) % WORLDS.length]!)
const tip = computed(() =>
  lesson && !doneToday
    ? { text: `Bugünün dersi hazır: ${lesson.title}.`, label: lesson.in_progress ? 'Devam edelim' : 'Başlayalım', to: `/ders/${lesson.id}` }
    : { text: `Yeni hikâye: ${world.value.title}. ${world.value.hook}`, label: 'Hikâyeye bak', to: '/kesfet' },
)

function toggle() {
  open.value = !open.value
  if (open.value) {
    playSound('piko')
    try {
      localStorage.setItem(KEY, today)
    } catch {
      /* ignore */
    }
  } else used.value = true
  arm()
}
function dismiss() {
  open.value = false
  used.value = true
}
</script>

<template>
  <div
    v-if="!used || open"
    class="fixed right-3 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+1.25rem)] flex flex-col items-end gap-2 md:right-6 md:bottom-6"
    style="z-index: var(--z-popover)"
  >
    <div v-if="open" class="guide-card surface rounded-card flex max-w-64 flex-col gap-2 border-2 border-primary p-3 shadow-(--shadow-card)" role="dialog" aria-label="Piko'nun önerisi">
      <div class="flex items-start justify-between gap-2">
        <p class="type-eyebrow text-ink-soft">Piko diyor ki</p>
        <button type="button" class="focus-ring text-ink-soft grid size-8 place-items-center rounded-full" aria-label="Önerisini kapat" @click="dismiss"><X :size="18" aria-hidden="true" /></button>
      </div>
      <p class="type-body text-ink">{{ tip.text }}</p>
      <CandyButton variant="drop" as="router-link" :to="tip.to" @click="dismiss">{{ tip.label }}</CandyButton>
      <button type="button" class="type-small text-ink-soft focus-ring rounded-control min-h-11 self-start px-1 underline" @click="dismiss">Bugünlük yeter</button>
    </div>
    <button
      type="button"
      class="guide-piko focus-ring rounded-full"
      :class="{ 'is-new': !open }"
      :aria-expanded="open"
      aria-label="Piko'nun önerisi"
      @click="toggle"
    >
      <LuguMascot character="piko" :expression="looking ? 'thinking' : 'happy'" :size="64" :animated="!reduced" />
    </button>
  </div>
</template>

<style scoped>
.guide-piko {
  display: grid;
  min-width: 3.5rem;
  min-height: 3.5rem;
  place-items: center;
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  box-shadow: var(--shadow-card);
}
.guide-piko.is-new {
  animation: guide-in var(--duration-slow) var(--ease-pop) both;
}
.guide-card {
  animation: guide-in var(--duration-base) var(--ease-sheet) both;
}
@keyframes guide-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}
@media (prefers-reduced-motion: reduce) {
  .guide-piko.is-new,
  .guide-card {
    animation: none;
  }
}
</style>
