<script setup lang="ts">
import { computed } from 'vue'

/*
 * Lugu's small decorative cats: never a character, never spoken to, always
 * at the edge of a scene (on a map node, behind a card, asleep on a break
 * screen). Four poses, one silhouette language: solid fur, cream details.
 */
export type CatPose = 'sit' | 'sleep' | 'peek' | 'walk'

const {
  pose = 'sit',
  size = 40,
  fur = 'var(--color-ink)',
  detail = 'var(--color-canvas)',
} = defineProps<{
  pose?: CatPose
  size?: number | string
  fur?: string
  detail?: string
}>()

const POSES: Record<CatPose, { body: string[]; lines: string[]; dots: [number, number][] }> = {
  sit: {
    body: [
      'M12 38C10 30 13 23 20 22C27 23 30 30 28 38Z',
      'M13 15L13 7L18 11C19 10.6 21 10.6 22 11L27 7L27 15C28 21 24 24 20 24C16 24 12 21 13 15Z',
      'M27 36C34 37 36 31 33 27C32 26 33 25 34 26C38 30 36 39 27 38Z',
    ],
    lines: [],
    dots: [[17.5, 16], [22.5, 16]],
  },
  sleep: {
    body: [
      'M5 33C5 25 13 21 22 21C31 21 36 25 36 31C36 35 32 37 22 37C12 37 5 37 5 33Z',
      'M4 28L4.5 20L9 24C10 23.6 12 23.6 13 24L17 20L17 28C17 33 13.5 35 10.5 35C7 35 4 33 4 28Z',
      'M34 32C38 33 39 37 34 38L14 38C20 37 30 37 34 32Z',
    ],
    lines: ['M7 29Q8.5 30.4 10 29', 'M11.5 29Q13 30.4 14.5 29'],
    dots: [],
  },
  peek: {
    body: [
      'M9 30C9 22 14 17 20 17C26 17 31 22 31 30Z',
      'M10 22L10 12L15 16.5C17 15.8 23 15.8 25 16.5L30 12L30 22Z',
      'M8 30C8 27 14 27 14 30Z',
      'M26 30C26 27 32 27 32 30Z',
    ],
    lines: ['M2 30.5L38 30.5'],
    dots: [[16.5, 23], [23.5, 23]],
  },
  walk: {
    body: [
      'M9 22C9 18 14 16 22 16C29 16 33 18 33 23C33 27 29 29 21 29C13 29 9 27 9 22Z',
      'M27 17L27.5 9L32 13C33 12.6 35 12.6 36 13L39.5 9.5L39 17C39 21 36.5 23 33.5 23C30 23 27 21 27 17Z',
      'M11 27L10 35L13 35L15 28Z',
      'M17 28L17 35L20 35L20 28Z',
      'M24 28L25 35L28 35L28 27Z',
      'M10 21C6 19 4 14 6 9C6.5 8 8 8 7.8 9.4C7 13 8 17 11 18.5Z',
    ],
    lines: [],
    dots: [[31.5, 17], [35.5, 17]],
  },
}

const art = computed(() => POSES[pose])
const box = computed(() => (typeof size === 'number' ? `${size}px` : size))
</script>

<template>
  <svg viewBox="0 0 40 40" :width="box" :height="box" aria-hidden="true" focusable="false" class="pointer-events-none shrink-0">
    <path v-for="(d, i) in art.body" :key="`b${i}`" :d="d" :fill="fur" />
    <path
      v-for="(d, i) in art.lines"
      :key="`l${i}`"
      :d="d"
      fill="none"
      :stroke="i === 0 && pose === 'peek' ? fur : detail"
      stroke-width="1.4"
      stroke-linecap="round"
    />
    <circle v-for="([x, y], i) in art.dots" :key="`d${i}`" :cx="x" :cy="y" r="1.3" :fill="detail" />
  </svg>
</template>
