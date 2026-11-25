<script setup lang="ts">
import { computed } from 'vue'

/*
 * The lesson jar as a picture (wow-pass C1, C6, C7, D1): body, a lid that can
 * sit closed, ajar or open, and up to 12 candies inside. Decoration only; the
 * words live next to it. The lid moves on transform only, 340 ms; under
 * reduced motion it just sits in the final position.
 */
const {
  lid = 'closed',
  candies = 0,
  size = 120,
  drop = false,
  glow = false,
} = defineProps<{
  lid?: 'closed' | 'ajar' | 'open'
  /** Candies settled in the jar (0-12). */
  candies?: number
  size?: number
  /** New candies fall in from above instead of popping. */
  drop?: boolean
  /** Short halo (a candy just landed). */
  glow?: boolean
}>()

const BODY = 'M10 13h28c3 0 5 3 5 6v27a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8V19c0-3 2-6 5-6z'
const FILLS = ['var(--color-accent)', 'var(--color-star)', 'var(--color-primary-fill)', 'var(--color-positive)']
const items = computed(() =>
  Array.from({ length: Math.max(0, Math.min(12, candies)) }, (_, i) => {
    const row = Math.floor(i / 3)
    const col = i % 3
    return { key: i, cx: 15 + col * 9 + (row % 2) * 2, cy: 48 - row * 8, fill: FILLS[i % FILLS.length]! }
  }),
)
</script>

<template>
  <svg viewBox="-6 -10 60 76" :width="size" :height="(size * 76) / 60" class="lesson-jar overflow-visible" :data-glow="glow || undefined" focusable="false" aria-hidden="true">
    <ellipse cx="24" cy="57" rx="20" ry="3" fill="var(--color-ink)" opacity="0.12" />
    <defs>
      <clipPath id="lesson-jar-body"><path :d="BODY" /></clipPath>
    </defs>
    <path :d="BODY" fill="var(--color-surface)" />
    <g clip-path="url(#lesson-jar-body)">
      <circle
        v-for="(c, i) in items"
        :key="c.key"
        :cx="c.cx"
        :cy="c.cy"
        r="3.8"
        :fill="c.fill"
        stroke="var(--color-ink)"
        stroke-width="1.2"
        :class="drop ? 'jar-drop' : 'animate-pop'"
        :style="{ animationDelay: `${i * 60}ms`, transformOrigin: `${c.cx}px ${c.cy}px` }"
      />
    </g>
    <path d="M13 22v18" stroke="var(--color-surface)" stroke-width="3" stroke-linecap="round" opacity="0.7" />
    <path :d="BODY" fill="none" stroke="var(--color-ink-soft)" stroke-width="2.4" stroke-linejoin="round" />
    <g class="jar-lid" :data-lid="lid">
      <rect x="11" y="3" width="26" height="8" rx="3" fill="var(--color-primary-fill)" stroke="var(--color-ink-soft)" stroke-width="2" />
      <path d="M15 6h8" stroke="var(--color-on-primary)" stroke-width="1.6" stroke-linecap="round" opacity="0.5" />
    </g>
  </svg>
</template>

<style scoped>
.lesson-jar[data-glow] {
  filter: drop-shadow(0 0 8px color-mix(in oklab, var(--color-star) 80%, transparent));
}
.jar-lid {
  transition: transform var(--duration-slow) var(--ease-pop);
  transform-box: fill-box;
  transform-origin: 0% 100%;
}
.jar-lid[data-lid='ajar'] {
  transform: translate(2px, -2px) rotate(-8deg);
}
.jar-lid[data-lid='open'] {
  transform: translate(7px, -5px) rotate(-22deg);
}
.jar-drop {
  animation: jar-drop 420ms var(--ease-pop) both;
}
@keyframes jar-drop {
  from {
    transform: translateY(-34px);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .jar-lid {
    transition: none;
  }
  .jar-drop {
    animation: none;
  }
}
</style>
