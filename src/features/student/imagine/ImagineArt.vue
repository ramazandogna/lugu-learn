<script setup lang="ts">
import { computed } from 'vue'

import { COLORS, type CardArt } from './imagine'

/* The picture of a card: a creature built from parts, or a small stage with word stickers. */
const { art, size = 160, bgLabels = [] } = defineProps<{ art: CardArt; size?: number; bgLabels?: readonly string[] }>()

const EYES = { 1: [60], 2: [48, 72], 3: [42, 60, 78] } as const
const paint = computed(() => (art.kind === 'character' ? (COLORS.find((c) => c.key === art.creature.color)?.css ?? COLORS[0].css) : ''))
const BG = [
  'linear-gradient(180deg, color-mix(in oklab, var(--color-ink) 85%, var(--color-primary-fill)), color-mix(in oklab, var(--color-primary-fill) 70%, var(--color-ink)))',
  'linear-gradient(180deg, color-mix(in oklab, var(--color-positive) 35%, var(--color-surface)), color-mix(in oklab, var(--color-positive) 65%, var(--color-ink)))',
  'linear-gradient(180deg, color-mix(in oklab, var(--color-accent) 35%, var(--color-surface)), color-mix(in oklab, var(--color-star) 70%, var(--color-surface)))',
]
const SPOTS = [
  { x: 6, y: 52 },
  { x: 36, y: 20 },
  { x: 62, y: 56 },
]
</script>

<template>
  <svg
    v-if="art.kind === 'character'"
    viewBox="0 0 120 120"
    :width="size"
    :height="size"
    role="img"
    aria-label="Kurduğun karakter"
    focusable="false"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <ellipse cx="60" cy="110" rx="30" ry="4" fill="var(--color-ink)" opacity="0.12" />
    <g v-if="art.creature.extra === 'wings'" :fill="paint" opacity="0.75" stroke="var(--color-ink)" stroke-width="3">
      <ellipse cx="22" cy="66" rx="14" ry="22" />
      <ellipse cx="98" cy="66" rx="14" ry="22" />
    </g>
    <g v-if="art.creature.extra === 'horns'" fill="var(--color-star)" stroke="var(--color-ink)" stroke-width="3">
      <path d="M40 34 L36 12 L52 28 Z" />
      <path d="M80 34 L84 12 L68 28 Z" />
    </g>
    <g v-if="art.creature.extra === 'antenna'" stroke="var(--color-ink)" stroke-width="3" fill="var(--color-star)">
      <path d="M60 30 V12" fill="none" />
      <circle cx="60" cy="10" r="6" />
    </g>
    <g :fill="paint" stroke="var(--color-ink)" stroke-width="3">
      <ellipse v-if="art.creature.body === 'round'" cx="60" cy="68" rx="36" ry="34" />
      <rect v-else-if="art.creature.body === 'tall'" x="32" y="26" width="56" height="80" rx="28" />
      <path v-else-if="art.creature.body === 'blob'" d="M28 82 C16 50 38 26 62 28 C90 30 104 56 92 84 C86 102 38 106 28 82Z" />
      <rect v-else x="26" y="34" width="68" height="68" rx="16" />
    </g>
    <g v-for="x in EYES[art.creature.eyes]" :key="x">
      <circle :cx="x" cy="62" r="8" fill="var(--color-surface)" stroke="var(--color-ink)" stroke-width="2" />
      <circle :cx="x" cy="63" r="3.5" fill="var(--color-ink)" />
    </g>
    <path d="M48 82 Q60 92 72 82" fill="none" stroke="var(--color-ink)" stroke-width="3" />
  </svg>
  <div
    v-else
    class="rounded-tile relative overflow-hidden"
    :style="{ width: `${size * 1.5}px`, height: `${size}px`, background: BG[art.bg] ?? BG[0] }"
    role="img"
    :aria-label="`Kurduğun sahne: ${bgLabels[art.bg] ?? 'sahne'}`"
  >
    <span
      v-for="(it, i) in art.items"
      :key="i"
      class="type-small text-ink bg-surface absolute rounded-full px-2 py-1 font-bold shadow-(--shadow-card)"
      lang="en"
      :style="{ left: `${SPOTS[i]?.x}%`, top: `${SPOTS[i]?.y}%` }"
    >
      {{ it }}
    </span>
  </div>
</template>
