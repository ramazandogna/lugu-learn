<script setup lang="ts">
import { computed } from 'vue'

import { star } from '../mascots/geometry'

/*
 * The learner's XP. XP only ever grows (product rule: no decrease, no
 * penalty), so this shows a total, never a delta below zero. Gold lives on
 * the star glyph; the number is ink on the surface.
 */
const {
  xp,
  unit = 'XP',
  label,
  size = 'md',
} = defineProps<{
  xp: number
  unit?: string
  /** Full accessible name, e.g. "Toplam 1.240 XP". Defaults to the visible text. */
  label?: string
  size?: 'sm' | 'md'
}>()

const formatted = computed(() => new Intl.NumberFormat('tr-TR').format(Math.max(0, Math.floor(xp))))
const path = star(12, 12.6, 10.5, 5)
</script>

<template>
  <span
    class="control inline-flex items-center gap-1.5 rounded-full font-extrabold text-ink"
    :class="size === 'sm' ? 'h-8 ps-1.5 pe-2.5 text-sm' : 'h-10 ps-2 pe-3.5 text-base'"
    :aria-label="label"
    :role="label ? 'img' : undefined"
  >
    <svg viewBox="0 0 24 24" :width="size === 'sm' ? 20 : 24" :height="size === 'sm' ? 20 : 24" aria-hidden="true" focusable="false">
      <path :d="path" fill="var(--color-star)" stroke="var(--color-ink)" stroke-width="1.6" stroke-linejoin="round" />
    </svg>
    <span class="tabular-nums">{{ formatted }}</span>
    <span class="text-ink-soft text-xs font-black tracking-wide">{{ unit }}</span>
  </span>
</template>
