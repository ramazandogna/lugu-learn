<script setup lang="ts">
import { computed } from 'vue'

/*
 * Progress as a jar that fills with candies (design-bible C5). The empty jar
 * is always drawn (an outline on the surface), so "0" is never an invisible
 * bar. It is a real progressbar: the numbers are in aria-valuenow/max and the
 * words in aria-valuetext; the optional slot is the visible text beside it.
 * A candy settles in 200 ms on --ease-pop; reduced motion stills it (main.css).
 */
const {
  value,
  max,
  label,
  size = 'md',
} = defineProps<{
  value: number
  max: number
  /** Accessible name and value text, e.g. "7 dersten 2 ders tamamlandı". */
  label: string
  size?: 'sm' | 'md' | 'lg'
}>()

const safeMax = computed(() => Math.max(1, max))
const now = computed(() => Math.max(0, Math.min(safeMax.value, Number.isFinite(value) ? value : 0)))
const ratio = computed(() => now.value / safeMax.value)
const px = computed(() => ({ sm: 36, md: 56, lg: 84 })[size])
/** At most 12 candies in the jar; more steps just scale the count. */
const candies = computed(() => {
  const n = now.value === 0 ? 0 : Math.max(1, Math.round(ratio.value * 12))
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / 3)
    const col = i % 3
    return { key: i, cx: 15 + col * 9 + (row % 2) * 2, cy: 48 - row * 8, fill: ['var(--color-accent)', 'var(--color-star)', 'var(--color-primary-fill)'][i % 3]! }
  })
})
/** Syrup level inside the body (y 14..52 = 38 high). */
const level = computed(() => 38 * ratio.value)
const BODY = 'M10 13h28c3 0 5 3 5 6v27a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8V19c0-3 2-6 5-6z'
</script>

<template>
  <div class="flex items-center gap-3">
    <span
      role="progressbar"
      class="inline-flex shrink-0"
      :aria-label="label"
      aria-valuemin="0"
      :aria-valuemax="safeMax"
      :aria-valuenow="now"
      :aria-valuetext="label"
    >
      <svg viewBox="0 0 48 56" :width="px" :height="(px * 56) / 48" focusable="false" aria-hidden="true" class="overflow-visible">
        <defs>
          <clipPath :id="`jar-${size}`"><path :d="BODY" /></clipPath>
        </defs>
        <path :d="BODY" fill="var(--color-surface)" />
        <g :clip-path="`url(#jar-${size})`">
          <rect x="0" :y="52 - level" width="48" :height="level + 4" fill="var(--color-wash)" class="jar-level" />
          <circle v-for="(c, i) in candies" :key="c.key" :cx="c.cx" :cy="c.cy" r="3.8" :fill="c.fill" stroke="var(--color-ink)" stroke-width="1.2" class="animate-pop" :style="{ animationDelay: `${i * 60}ms`, transformOrigin: `${c.cx}px ${c.cy}px` }" />
        </g>
        <path :d="BODY" fill="none" stroke="var(--color-ink-soft)" stroke-width="2.4" stroke-linejoin="round" />
        <rect x="11" y="3" width="26" height="8" rx="3" fill="var(--color-primary-fill)" stroke="var(--color-ink-soft)" stroke-width="2" />
      </svg>
    </span>
    <div v-if="$slots.default" class="min-w-0 flex-1"><slot /></div>
  </div>
</template>

<style scoped>
.jar-level {
  transition: y var(--duration-slow) var(--ease-sheet), height var(--duration-slow) var(--ease-sheet);
}
</style>
