<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

import { useReducedMotion } from '@/design'

/*
 * C3 "Şeker uçuşu": one candy leaves `from` (the finished section's place) in
 * an arc and lands in the lesson jar (any `[data-lesson-jar]` that is on
 * screen), 600 ms on transform + opacity only, then the jar glows 340 ms.
 * Bump `trigger` to play. Reduced motion: no flight, no glow.
 */
const { trigger, from } = defineProps<{ trigger: number; from: HTMLElement | null | undefined }>()
const emit = defineEmits<{ land: [] }>()

const reduced = useReducedMotion()
const el = ref<HTMLElement | null>(null)
const live = ref(false)
let glowTimer: ReturnType<typeof setTimeout> | undefined

function target(): HTMLElement | null {
  return [...document.querySelectorAll<HTMLElement>('[data-lesson-jar]')].find((n) => n.getBoundingClientRect().width > 0) ?? null
}

watch(
  () => trigger,
  async () => {
    const to = target()
    const a = from?.getBoundingClientRect()
    if (reduced.value || !to || !a || typeof Element.prototype.animate !== 'function') {
      emit('land')
      return
    }
    const b = to.getBoundingClientRect()
    live.value = true
    await new Promise((r) => requestAnimationFrame(r))
    const node = el.value
    if (!node) return
    const x0 = a.left + a.width / 2
    const y0 = a.top + Math.min(a.height / 2, 24)
    const x1 = b.left + b.width / 2
    const y1 = b.top + b.height / 2
    const lift = Math.min(120, Math.abs(y1 - y0) / 2 + 40)
    const run = node.animate(
      [
        { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0 },
        { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - lift}px) scale(1.2)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${x1}px, ${y1}px) scale(0.7)`, opacity: 0.9 },
      ],
      { duration: 600, easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)', fill: 'forwards' },
    )
    await run.finished.catch(() => {})
    live.value = false
    to.setAttribute('data-glow', '')
    clearTimeout(glowTimer)
    glowTimer = setTimeout(() => to.removeAttribute('data-glow'), 340)
    emit('land')
  },
)
onBeforeUnmount(() => clearTimeout(glowTimer))
</script>

<template>
  <div v-if="live" ref="el" class="pointer-events-none fixed top-0 left-0 -mt-3 -ml-3" style="z-index: var(--z-overlay)" aria-hidden="true">
    <svg viewBox="0 0 24 14" width="24" height="14">
      <path d="M2 3l5 2.5v3L2 11z M22 3l-5 2.5v3L22 11z" fill="var(--color-accent)" />
      <rect x="6" y="2" width="12" height="10" rx="5" fill="var(--color-star)" stroke="var(--color-ink)" stroke-width="1.2" />
    </svg>
  </div>
</template>

<style>
[data-lesson-jar][data-glow] {
  animation: lesson-jar-glow 340ms ease-out;
}
@keyframes lesson-jar-glow {
  40% {
    filter: drop-shadow(0 0 10px var(--color-star)) brightness(1.1);
  }
}
</style>
