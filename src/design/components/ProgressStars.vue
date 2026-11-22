<script setup lang="ts">
import { computed } from 'vue'

import { star } from '../mascots/geometry'

/*
 * Earned stars, read-only. (rei-kit's BaseRating is an input for choosing a
 * score; this only reports one.) The count is in the accessible name, and an
 * unearned star is an outline rather than only a paler colour.
 */
const {
  value,
  max = 3,
  label,
  size = 'md',
} = defineProps<{
  value: number
  max?: number
  /** Accessible name, e.g. "3 yıldızdan 2 yıldız". */
  label: string
  size?: 'sm' | 'md' | 'lg'
}>()

const earned = computed(() => Math.max(0, Math.min(max, Math.round(Number.isFinite(value) ? value : 0))))
const px = computed(() => ({ sm: 18, md: 28, lg: 44 })[size])
const path = star(12, 12.6, 10.5, 5)
</script>

<template>
  <span class="inline-flex items-center gap-0.5" role="img" :aria-label="label">
    <svg
      v-for="i in max"
      :key="i"
      viewBox="0 0 24 24"
      :width="px"
      :height="px"
      aria-hidden="true"
      focusable="false"
      :class="{ 'animate-pop': i <= earned }"
      :style="{ animationDelay: `${(i - 1) * 120}ms` }"
    >
      <path
        :d="path"
        :fill="i <= earned ? 'var(--color-star)' : 'transparent'"
        :stroke="i <= earned ? 'var(--color-ink)' : 'var(--color-ink-soft)'"
        stroke-width="1.6"
        stroke-linejoin="round"
        :stroke-dasharray="i <= earned ? undefined : '3 2.4'"
      />
    </svg>
  </span>
</template>
