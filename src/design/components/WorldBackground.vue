<script setup lang="ts">
import { computed } from 'vue'

import type { CharacterKey } from '@/domain/content'

import { CHARACTERS, characterThemeStyle, type Motif } from '../characters'
import { MOTIFS } from '../world-motifs'

/*
 * The illustrated ground of a student scene. Scenery stays at the edges — a
 * corner ornament and a ground band — so the middle, where text and tasks
 * sit, is calm. Purely decorative: hidden from assistive technology and
 * never intercepting a tap.
 */
const {
  character,
  motif,
  intensity = 'soft',
  animated = false,
  as = 'div',
} = defineProps<{
  /** Applies that character's theme to the whole subtree, and their motif. */
  character?: CharacterKey
  /** Overrides the character's motif, or sets one without a character theme. */
  motif?: Motif
  /** `rich` for hero moments (map, celebration), `soft` behind reading. */
  intensity?: 'soft' | 'rich'
  /** Slow drift on clouds and bubbles; off under prefers-reduced-motion. */
  animated?: boolean
  as?: string
}>()

const scene = computed(() => MOTIFS[motif ?? (character ? CHARACTERS[character].motif : 'dream')])
const themeAttrs = computed(() => (character ? { 'data-character': character, style: characterThemeStyle(character) } : {}))
</script>

<template>
  <component :is="as" class="lugu-world relative isolate overflow-hidden" :class="`is-${intensity}`" v-bind="themeAttrs">
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="lugu-world-sky absolute inset-0" />
      <svg
        class="absolute -top-2 -right-2 h-40 w-40 sm:h-56 sm:w-56"
        viewBox="0 0 160 160"
        preserveAspectRatio="xMaxYMin meet"
        focusable="false"
      >
        <path
          v-for="(s, i) in scene.corner"
          :key="`c${i}`"
          :d="s.d"
          :fill="s.fill"
          :opacity="s.opacity"
          :class="{ 'animate-drift': animated && s.drift }"
        />
      </svg>
      <svg
        class="absolute inset-x-0 bottom-0 h-24 w-full sm:h-32"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          v-for="(s, i) in scene.ground"
          :key="`g${i}`"
          :d="s.d"
          :fill="s.fill"
          :opacity="s.opacity"
          :class="{ 'animate-drift': animated && s.drift }"
        />
      </svg>
      <svg class="absolute bottom-0 left-0 h-20 w-32 sm:h-24 sm:w-40" viewBox="0 0 160 100" preserveAspectRatio="xMinYMax meet" focusable="false">
        <path
          v-for="(s, i) in scene.low"
          :key="`l${i}`"
          :d="s.d"
          :fill="s.fill"
          :opacity="s.opacity"
          :class="{ 'animate-drift': animated && s.drift }"
        />
      </svg>
    </div>
    <slot />
  </component>
</template>

<style scoped>
.lugu-world-sky {
  background:
    radial-gradient(120% 70% at 85% 0%, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 60%),
    linear-gradient(180deg, var(--color-wash), var(--color-canvas) 75%);
}

.is-soft .lugu-world-sky {
  background: linear-gradient(180deg, var(--color-wash), var(--color-canvas) 60%);
}
</style>
