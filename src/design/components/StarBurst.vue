<script setup lang="ts">
import { computed } from 'vue'

import { sparkle, star } from '../mascots/geometry'

/*
 * The completion burst: soft rays and stars that grow once behind whatever
 * sits in the middle (usually a celebrating mascot). It never loops — a
 * celebration that keeps going stops meaning anything.
 */
const { size = 240, animated = true } = defineProps<{
  size?: number | string
  animated?: boolean
}>()

const RAYS = 14
const rays = Array.from({ length: RAYS }, (_, i) => {
  const a0 = (i / RAYS) * Math.PI * 2
  const a1 = a0 + Math.PI / RAYS / 1.4
  const p = (a: number, r: number) => `${(100 + r * Math.cos(a)).toFixed(1)} ${(100 + r * Math.sin(a)).toFixed(1)}`
  return `M${p(a0, 34)}L${p(a0, 96)}L${p(a1, 96)}L${p(a1, 34)}Z`
})
const stars = [star(34, 40, 9), star(166, 50, 11), star(156, 160, 8), star(46, 150, 7)]
const glints = [sparkle(100, 14, 7), sparkle(186, 104, 6), sparkle(14, 100, 6), sparkle(100, 188, 5)]
const box = computed(() => (typeof size === 'number' ? `${size}px` : size))
</script>

<template>
  <svg viewBox="0 0 200 200" :width="box" :height="box" aria-hidden="true" focusable="false" class="pointer-events-none overflow-visible">
    <g :class="{ 'animate-burst': animated }" style="transform-origin: 100px 100px">
      <circle cx="100" cy="100" r="62" fill="var(--color-wash)" />
      <path v-for="(d, i) in rays" :key="`r${i}`" :d="d" fill="var(--color-accent)" opacity="0.28" stroke-linejoin="round" />
      <path v-for="(d, i) in stars" :key="`s${i}`" :d="d" fill="var(--color-star)" stroke="var(--color-ink)" stroke-width="2" stroke-linejoin="round" />
      <path
        v-for="(d, i) in glints"
        :key="`g${i}`"
        :d="d"
        fill="var(--color-primary)"
        :class="{ 'animate-twinkle': animated }"
        :style="{ transformOrigin: 'center', transformBox: 'fill-box', animationDelay: `${i * 0.4}s` }"
      />
    </g>
  </svg>
</template>
