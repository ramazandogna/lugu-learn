<script setup lang="ts">
import { computed } from 'vue'

const { points, label } = defineProps<{ points: readonly number[]; label: string }>()

const W = 96
const H = 28
const path = computed(() => {
  const ys = points.slice(-12)
  if (ys.length < 2) return ''
  const min = Math.min(...ys)
  const span = Math.max(...ys) - min || 1
  return ys.map((y, i) => `${i ? 'L' : 'M'}${((i / (ys.length - 1)) * (W - 4) + 2).toFixed(1)},${(H - 3 - ((y - min) / span) * (H - 6)).toFixed(1)}`).join(' ')
})
</script>

<template>
  <svg v-if="path" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" role="img" :aria-label="label" class="text-primary shrink-0">
    <path :d="path" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
