<script setup lang="ts">
import { computed } from 'vue'

import type { CharacterKey } from '@/domain/content'

import { MASCOT_PALETTES, MASCOT_RIGS, drawExpression, type Expression, type Shape } from '../mascots'
import { ellipse } from '../mascots/geometry'

export type MascotMood = 'idle' | 'think' | 'cheer' | 'oops-soft' | 'wow' | 'sleepy' | 'point'

/** A mood is an expression plus one short body move (wow-pass C4); `idle` leaves the expression as given. */
const MOOD_EXPRESSION: Record<Exclude<MascotMood, 'idle'>, Expression> = {
  think: 'thinking',
  cheer: 'celebrating',
  'oops-soft': 'thinking',
  wow: 'surprised',
  sleepy: 'resting',
  point: 'encouraging',
}

const {
  character,
  expression = 'happy',
  mood = 'idle',
  size = 96,
  label,
  animated = false,
} = defineProps<{
  character: CharacterKey
  expression?: Expression
  /** Pixel size of the square, or any CSS length. */
  size?: number | string
  /**
   * The accessible name ("Piko gülümsüyor"). Given, the drawing is an image;
   * left out, it is decoration and hidden from assistive technology.
   */
  label?: string
  /** A gentle idle bob and blink. Off under prefers-reduced-motion regardless. */
  animated?: boolean
  /** Reaction for the lesson (cheer / oops-soft / wow ...). Sets the face and one 300-700 ms move; none under reduced motion. */
  mood?: MascotMood
}>()

const palette = computed(() => MASCOT_PALETTES[character])
const rig = computed(() => MASCOT_RIGS[character])
const layers = computed(() => drawExpression(rig.value, mood === 'idle' ? expression : MOOD_EXPRESSION[mood]))
const shadow = ellipse(60, 111, 26, 4)
const box = computed(() => (typeof size === 'number' ? `${size}px` : size))

function paint(shape: Shape) {
  const p = palette.value
  return {
    d: shape.d,
    fill: shape.fill === 'none' ? 'none' : p[shape.fill],
    stroke: shape.stroke ? p[shape.stroke] : shape.outline ? p.ink : undefined,
    'stroke-width': shape.strokeWidth ?? (shape.outline ? 3 : undefined),
    opacity: shape.opacity,
  }
}
</script>

<template>
  <svg
    viewBox="0 0 120 120"
    :width="box"
    :height="box"
    class="lugu-mascot shrink-0 overflow-visible"
    :class="{ 'is-animated': animated }"
    :data-mood="mood === 'idle' ? undefined : mood"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path :d="shadow" :fill="palette.ink" opacity="0.12" />
    <g class="lugu-mascot-figure">
      <path v-for="(s, i) in rig.back" :key="`b${i}`" v-bind="paint(s)" />
      <path v-for="(s, i) in rig.body" :key="`y${i}`" v-bind="paint(s)" />
      <path v-for="(s, i) in rig.front" :key="`f${i}`" v-bind="paint(s)" />
      <g :class="{ 'lugu-mascot-eyes': layers.canBlink }">
        <path v-for="(s, i) in layers.eyes" :key="`e${i}`" v-bind="paint(s)" />
      </g>
      <path v-for="(s, i) in layers.face" :key="`c${i}`" v-bind="paint(s)" />
      <path v-for="(s, i) in rig.over ?? []" :key="`o${i}`" v-bind="paint(s)" />
      <path v-for="(s, i) in layers.arms" :key="`a${i}`" v-bind="paint(s)" />
      <path v-for="(s, i) in layers.extras" :key="`x${i}`" v-bind="paint(s)" />
    </g>
  </svg>
</template>

<style scoped>
.is-animated .lugu-mascot-figure {
  animation: lugu-mascot-bob var(--duration-idle, 3600ms) ease-in-out infinite;
}

.is-animated .lugu-mascot-eyes {
  transform-box: fill-box;
  transform-origin: center;
  animation: lugu-mascot-blink 5.2s ease-in-out infinite;
}

@keyframes lugu-mascot-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2.5px);
  }
}

/* Closed for ~120ms out of every five seconds: alive, not twitchy. */
@keyframes lugu-mascot-blink {
  0%,
  95%,
  100% {
    transform: scaleY(1);
  }
  97% {
    transform: scaleY(0.1);
  }
}

/* Moods: one short move on the whole figure. No shake anywhere (pedagog 3). */
.lugu-mascot {
  transform-box: fill-box;
  transform-origin: 50% 92%;
}
[data-mood='think'] {
  animation: lugu-mood-think 400ms var(--ease-sheet) both;
}
[data-mood='cheer'] {
  animation: lugu-mood-cheer 600ms var(--ease-pop) both;
}
[data-mood='oops-soft'] {
  animation: lugu-mood-oops 300ms var(--ease-standard) both;
}
[data-mood='wow'] {
  animation: lugu-mood-wow 700ms var(--ease-pop) both;
}
[data-mood='point'] {
  animation: lugu-mood-point 400ms var(--ease-sheet) both;
}
[data-mood='sleepy'] {
  animation: lugu-mood-sleepy 700ms var(--ease-sheet) both;
}
@keyframes lugu-mood-think {
  to {
    transform: rotate(8deg);
  }
}
@keyframes lugu-mood-cheer {
  35% {
    transform: translateY(-10%) scale(1.06) rotate(-4deg);
  }
  70% {
    transform: translateY(-4%) scale(1.03) rotate(4deg);
  }
  to {
    transform: none;
  }
}
@keyframes lugu-mood-oops {
  to {
    transform: rotate(-7deg) translateY(2%);
  }
}
@keyframes lugu-mood-wow {
  40% {
    transform: scale(1.12);
  }
  to {
    transform: scale(1.04);
  }
}
@keyframes lugu-mood-point {
  to {
    transform: rotate(-10deg) translateX(-3%);
  }
}
@keyframes lugu-mood-sleepy {
  to {
    transform: translateY(3%) rotate(4deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-mood] {
    animation: none;
  }
  .is-animated .lugu-mascot-figure,
  .is-animated .lugu-mascot-eyes {
    animation: none;
  }
}
</style>
