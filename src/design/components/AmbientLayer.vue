<script setup lang="ts">
import { computed } from 'vue'

import { AMBIENT_MAX_CANDIES, usePageVisible } from '../motion'

/*
 * Ambient objects, behind the content, never under text (put it on the edges of
 * a stage). `candy` is for login and home empty space; `gear`, `steam`, `tram`
 * are the unit ambients and sit at 6-8%. Hard limits (design-bible D): at most
 * 5 objects, no pull toward the pointer, pauses when the tab is hidden, and
 * stops entirely under reduced motion (main.css kills every animate-*; the
 * first frame stays). Turn it off (`active=false`) in timed play.
 */
const { kind = 'candy', count = 4, active = true } = defineProps<{
  kind?: 'candy' | 'gear' | 'steam' | 'tram'
  count?: number
  active?: boolean
}>()

const visible = usePageVisible()
const n = computed(() => Math.max(0, Math.min(count, AMBIENT_MAX_CANDIES)))
/** Fixed spots along the edges: deterministic, so a screen never reshuffles. */
const SPOTS = [
  { x: 6, y: 16, s: 28, d: 0 },
  { x: 90, y: 24, s: 36, d: 2 },
  { x: 12, y: 74, s: 32, d: 4 },
  { x: 86, y: 82, s: 26, d: 1 },
  { x: 48, y: 92, s: 22, d: 3 },
]
const items = computed(() => SPOTS.slice(0, n.value))
const tone = computed(() => (kind === 'candy' ? 0.7 : 0.07))
const PALETTE = ['var(--color-accent)', 'var(--color-star)', 'var(--color-primary-fill)', 'var(--color-wash)', 'var(--color-accent)']
</script>

<template>
  <div v-if="active" class="pointer-events-none absolute inset-0 overflow-hidden" style="z-index: var(--z-base)" aria-hidden="true">
    <template v-if="kind === 'tram'">
      <svg
        class="absolute bottom-6 start-0 h-10 w-40 animate-drift"
        style="animation-duration: 60s"
        :style="{ opacity: tone, animationPlayState: visible ? 'running' : 'paused' }"
        viewBox="0 0 160 40"
      >
        <rect x="4" y="8" width="152" height="24" rx="8" fill="var(--color-primary-fill)" />
        <rect x="16" y="14" width="22" height="10" rx="3" fill="var(--color-surface)" />
        <rect x="48" y="14" width="22" height="10" rx="3" fill="var(--color-surface)" />
        <rect x="80" y="14" width="22" height="10" rx="3" fill="var(--color-surface)" />
      </svg>
    </template>
    <template v-else>
      <span
        v-for="(it, i) in items"
        :key="i"
        class="animate-float absolute block"
        :style="{
          left: it.x + '%',
          top: it.y + '%',
          width: it.s + 'px',
          height: it.s + 'px',
          opacity: tone,
          animationDelay: `-${it.d * 2}s`,
          animationDuration: kind === 'steam' ? '24s' : kind === 'gear' ? '20s' : '9s',
          animationPlayState: visible ? 'running' : 'paused',
        }"
      >
        <svg v-if="kind === 'candy'" viewBox="0 0 32 32" class="size-full">
          <path d="M3 10 L11 16 L3 22 Z M29 10 L21 16 L29 22 Z" :fill="PALETTE[(i + 1) % PALETTE.length]" />
          <circle cx="16" cy="16" r="9" :fill="PALETTE[i % PALETTE.length]" />
          <path d="M10 13 Q16 8 22 13" fill="none" stroke="var(--color-surface)" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else-if="kind === 'gear'" viewBox="0 0 32 32" class="size-full">
          <circle cx="16" cy="16" r="9" fill="var(--color-primary-fill)" />
          <circle cx="16" cy="16" r="3.5" fill="var(--color-canvas)" />
          <path
            d="M14 2h4v5h-4zM14 25h4v5h-4zM2 14h5v4H2zM25 14h5v4h-5z"
            fill="var(--color-primary-fill)"
          />
        </svg>
        <svg v-else viewBox="0 0 32 32" class="size-full">
          <circle cx="12" cy="20" r="8" fill="var(--color-ink)" />
          <circle cx="21" cy="14" r="7" fill="var(--color-ink)" />
        </svg>
      </span>
    </template>
  </div>
</template>
