<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Play } from 'lucide-vue-next'

import { CandyButton, LessonJar, LuguMascot, playSound, useReducedMotion } from '@/design'

/*
 * C1 "Kavanoz Açılıyor": the jar lid opens, Piko floats in, the title appears
 * word by word, three goals drop into the jar as candies, then the one hero
 * button. Tap anywhere (or Esc) to skip straight to the lesson; the button is
 * there from the first frame for keyboards. Plays once per lesson.
 */
const { title, objectives, ms = 2400 } = defineProps<{
  title: string
  /** The lesson's goals (up to three are shown). */
  objectives: readonly string[]
  /** Total length of the scene (shorter after the 5th lesson). */
  ms?: number
}>()
const emit = defineEmits<{ start: [] }>()

const reduced = useReducedMotion()
const goals = computed(() => objectives.slice(0, 3))
const words = computed(() => title.split(/\s+/).filter(Boolean))
const k = computed(() => ms / 2400)
const at = (t: number) => Math.round(t * k.value)

const lid = ref<'closed' | 'open'>('closed')
const dropped = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
onMounted(() => {
  if (reduced.value) {
    lid.value = 'open'
    dropped.value = goals.value.length
    return
  }
  playSound('whoosh')
  timers.push(setTimeout(() => (lid.value = 'open'), at(250)))
  goals.value.forEach((_, i) =>
    timers.push(
      setTimeout(() => {
        dropped.value = i + 1
        playSound('pop')
      }, at(900 + i * 320)),
    ),
  )
})
onBeforeUnmount(() => timers.forEach(clearTimeout))

function skip(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.candy')) return
  emit('start')
}
</script>

<template>
  <section
    class="intro surface rounded-shell relative flex min-h-[26rem] flex-col items-center justify-center gap-4 overflow-hidden px-4 py-8 text-center"
    :style="{ '--k': k }"
    aria-labelledby="intro-title"
    @click="skip"
    @keydown.esc="emit('start')"
  >
    <div class="relative grid place-items-center">
      <LessonJar :lid="lid" :candies="dropped" :size="150" drop :glow="dropped > 0 && dropped < goals.length + 1 && !reduced" />
      <div class="intro-piko absolute -right-20 -bottom-2 sm:-right-28" aria-hidden="true">
        <LuguMascot character="piko" expression="happy" :size="72" :animated="!reduced" />
      </div>
    </div>
    <div>
      <p class="type-eyebrow text-ink-soft intro-fade" style="--d: 0.3">Bugünün kavanozu</p>
      <h2 id="intro-title" class="type-hero text-ink" lang="en" :aria-label="title">
        <span v-for="(w, i) in words" :key="i" class="intro-word" :style="{ '--i': i }" aria-hidden="true">{{ w }}&nbsp;</span>
      </h2>
    </div>
    <ul v-if="goals.length" class="flex max-w-xl flex-col gap-1.5 text-start" aria-label="Bugünkü hedefler">
      <li v-for="(g, i) in goals" :key="i" class="type-small text-ink intro-fade flex items-start gap-2" :style="{ '--d': 0.9 + i * 0.3 }">
        <span class="bg-accent mt-1.5 inline-block size-2.5 shrink-0 rounded-full" aria-hidden="true" />
        <span>{{ g }}</span>
      </li>
    </ul>
    <CandyButton variant="wrapper" class="intro-cta mt-2" @click="emit('start')"><Play :size="20" aria-hidden="true" /> Başlayalım</CandyButton>
    <p class="type-small text-ink-soft">Bir yere dokun, doğrudan başlar.</p>
  </section>
</template>

<style scoped>
.intro-word {
  display: inline-block;
  animation: intro-word calc(340ms * var(--k, 1)) var(--ease-sheet) both;
  animation-delay: calc(var(--i) * 60ms + 450ms * var(--k, 1));
}
.intro-fade {
  animation: intro-fade calc(340ms * var(--k, 1)) var(--ease-standard) both;
  animation-delay: calc(var(--d, 0) * 1000ms * var(--k, 1));
}
.intro-piko {
  animation: intro-piko calc(700ms * var(--k, 1)) var(--ease-sheet) both;
  animation-delay: calc(350ms * var(--k, 1));
}
.intro-cta {
  animation: intro-opacity calc(340ms * var(--k, 1)) var(--ease-standard) both;
  animation-delay: calc(1700ms * var(--k, 1));
}
@keyframes intro-word {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@keyframes intro-fade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
@keyframes intro-opacity {
  from {
    opacity: 0;
  }
}
@keyframes intro-piko {
  from {
    opacity: 0;
    transform: translate(40px, -30px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .intro-word,
  .intro-fade,
  .intro-piko,
  .intro-cta {
    animation: none;
  }
}
</style>
