<script setup lang="ts">
import { computed } from 'vue'

import { sparkle } from '../mascots/geometry'

const {
  count = 5,
  size = 96,
  tone = 'star',
  animated = true,
} = defineProps<{
  count?: number
  size?: number | string
  /** `star` gold, or the active theme's `primary` / `accent`. */
  tone?: 'star' | 'primary' | 'accent'
  /** Twinkle. Stops under prefers-reduced-motion. */
  animated?: boolean
}>()

/* Fixed spots rather than random ones, so a page does not rearrange itself on
   every render and a screenshot test stays stable. */
const SPOTS = [
  [20, 22, 9], [74, 16, 6], [86, 58, 8], [34, 74, 5], [56, 44, 4], [12, 54, 5], [64, 84, 6], [90, 30, 4],
] as const

const items = computed(() =>
  SPOTS.slice(0, Math.max(1, Math.min(count, SPOTS.length))).map(([x, y, r], i) => ({
    d: sparkle(x, y, r),
    origin: `${x}px ${y}px`,
    delay: `${(i * 0.37) % 2.6}s`,
  })),
)
const fill = computed(() => `var(--color-${tone})`)
const box = computed(() => (typeof size === 'number' ? `${size}px` : size))
</script>

<template>
  <svg viewBox="0 0 100 100" :width="box" :height="box" aria-hidden="true" focusable="false" class="pointer-events-none overflow-visible">
    <path
      v-for="(s, i) in items"
      :key="i"
      :d="s.d"
      :fill="fill"
      :class="{ 'animate-twinkle': animated }"
      :style="{ transformOrigin: s.origin, animationDelay: s.delay }"
    />
  </svg>
</template>
