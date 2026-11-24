<script setup lang="ts">
import { computed } from 'vue'

import { useReducedMotion } from '../motion'

/*
 * A short shower of candies after a right answer (pedagog: small celebration,
 * often; <= 8 pieces, <= 900 ms, no flashing, never over the text). Bump
 * `trigger` to play it once; `key` on the group replays it. Under reduced
 * motion nothing falls: the wax seal on the answer already says it.
 */
const { trigger, count = 8 } = defineProps<{ trigger: number; count?: number }>()
const reduced = useReducedMotion()
const PALETTE = ['var(--color-accent)', 'var(--color-star)', 'var(--color-primary-fill)', 'var(--color-positive)']
const pieces = computed(() =>
  Array.from({ length: Math.min(count, 8) }, (_, i) => ({
    left: 8 + ((i * 37) % 84),
    delay: (i * 55) % 260,
    drift: ((i % 3) - 1) * 14,
    fill: PALETTE[i % PALETTE.length]!,
  })),
)
</script>

<template>
  <div v-if="trigger > 0 && !reduced" :key="trigger" class="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden" aria-hidden="true">
    <svg
      v-for="(p, i) in pieces"
      :key="i"
      class="candy-fall absolute -top-4 block"
      viewBox="0 0 24 14"
      width="22"
      height="13"
      :style="{ left: `${p.left}%`, animationDelay: `${p.delay}ms`, '--drift': `${p.drift}px` }"
    >
      <path d="M2 3l5 2.5v3L2 11z M22 3l-5 2.5v3L22 11z" :fill="p.fill" />
      <rect x="6" y="2" width="12" height="10" rx="5" :fill="p.fill" stroke="var(--color-ink)" stroke-width="1.2" />
    </svg>
  </div>
</template>

<style scoped>
.candy-fall {
  animation: candy-fall 760ms var(--ease-standard) both;
}
@keyframes candy-fall {
  from {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  to {
    transform: translate(var(--drift), 220px) rotate(200deg);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .candy-fall {
    animation: none;
    opacity: 0;
  }
}
</style>
