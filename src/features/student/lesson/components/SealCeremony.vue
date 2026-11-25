<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Star } from 'lucide-vue-next'

import { LessonJar, LuguMascot, WaxSeal, playSound, useReducedMotion } from '@/design'

/*
 * C6 "Mühür Töreni" (the one big celebration of the lesson, with the finale):
 * a huge wax seal is pressed on the jar lid, the lid closes, the number of new
 * words counts up, three stars light one after the other. 2400 ms, tap or Esc
 * skips. No flash, nothing faster than 3 Hz. Reduced motion: the finished
 * picture at once.
 */
const { words } = defineProps<{ words: number }>()
const emit = defineEmits<{ done: [] }>()

const reduced = useReducedMotion()
const lid = ref<'open' | 'closed'>('open')
const count = ref(0)
const stars = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
let raf = 0

onMounted(() => {
  if (reduced.value) {
    lid.value = 'closed'
    count.value = words
    stars.value = 3
    playSound('kutlama-buyuk')
    timers.push(setTimeout(() => emit('done'), 2400))
    return
  }
  timers.push(
    setTimeout(() => {
      playSound('muhur')
      lid.value = 'closed'
    }, 900),
    setTimeout(() => playSound('kutlama-buyuk'), 1000),
  )
  ;[1200, 1500, 1800].forEach((t, i) => timers.push(setTimeout(() => (stars.value = i + 1), t)))
  const t0 = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, Math.max(0, (now - t0 - 1000) / 900))
    count.value = Math.round(words * p)
    if (p < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  timers.push(setTimeout(() => emit('done'), 2400))
})
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div
    class="cer fixed inset-0 grid place-items-center bg-[color-mix(in_oklab,var(--color-canvas)_97%,transparent)] px-4"
    style="z-index: var(--z-vignette)"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cer-title"
    tabindex="-1"
    @click="emit('done')"
    @keydown.esc="emit('done')"
  >
    <div class="flex flex-col items-center gap-3 text-center">
      <div class="relative grid place-items-center">
        <LessonJar :lid="lid" :candies="Math.min(12, count)" :size="190" drop />
        <div class="cer-seal absolute top-0 left-1/2" aria-hidden="true"><WaxSeal :size="120" /></div>
        <div class="absolute -right-24 bottom-0" aria-hidden="true"><LuguMascot character="piko" :mood="stars >= 3 ? 'cheer' : 'idle'" :size="84" :animated="!reduced" /></div>
      </div>
      <h2 id="cer-title" class="type-hero text-ink">Mühür basıldı!</h2>
      <p class="type-display text-ink tabular-nums" role="status">{{ count }} <span class="type-task text-ink-soft">yeni kelime</span></p>
      <div class="flex gap-2" aria-hidden="true">
        <Star v-for="n in 3" :key="n" :size="36" :stroke-width="2.4" class="cer-star" :class="n <= stars ? 'is-lit' : ''" />
      </div>
      <p class="type-small text-ink-soft">Geçmek için dokun.</p>
    </div>
  </div>
</template>

<style scoped>
.cer {
  animation: cer-in var(--duration-base) var(--ease-standard) both;
}
.cer-seal {
  transform: translate(-50%, -33%);
  animation: cer-press 900ms var(--ease-sheet) both;
}
.cer-star {
  color: var(--color-hair);
  fill: transparent;
  transition:
    color var(--duration-slow) var(--ease-pop),
    fill var(--duration-slow) var(--ease-pop),
    transform var(--duration-slow) var(--ease-pop);
}
.cer-star.is-lit {
  color: var(--color-star);
  fill: var(--color-star);
  transform: scale(1.12);
}
@keyframes cer-in {
  from {
    opacity: 0;
  }
}
@keyframes cer-press {
  0% {
    transform: translate(-50%, -140%) scale(2.2);
    opacity: 0;
  }
  60% {
    transform: translate(-50%, -33%) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -33%) scale(1);
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cer,
  .cer-seal {
    animation: none;
  }
  .cer-star {
    transition: none;
  }
}
</style>
