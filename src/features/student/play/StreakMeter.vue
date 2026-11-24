<script setup lang="ts">
import { computed } from 'vue'
import { Shield } from 'lucide-vue-next'

/*
 * In-quiz run streak ("Karamel Akışı"): three rising steps and a star (the Lugu
 * mark's idea), in the primary colour, never green. Steps at 5 / 10 / 15 add a
 * ring each. Breaking is soft: a 450 ms fade, no shake. Not the daily streak.
 */
const { streak, multiplier, shield = false, pop = 0, broke = 0 } = defineProps<{
  streak: number
  multiplier: 1 | 2 | 3
  shield?: boolean
  /** Bumped by the parent at every 5th correct: replays the burst. */
  pop?: number
  /** Bumped by the parent when the streak halves: replays the soft fade. */
  broke?: number
}>()

const tier = computed(() => (streak >= 15 ? 3 : streak >= 10 ? 2 : streak >= 5 ? 1 : 0))
</script>

<template>
  <div class="surface rounded-full border-primary flex min-h-11 items-center gap-2 border-2 px-3 py-1" :class="`tier-${tier}`" role="status">
    <span :key="`p${pop}`" class="grid size-8 place-items-center" :class="pop > 0 ? 'animate-burst' : ''" aria-hidden="true">
      <svg :key="`b${broke}`" viewBox="0 0 32 32" class="size-8" :class="broke > 0 ? 'animate-soft' : ''">
        <circle cx="6" cy="26" r="3" fill="var(--color-primary-fill)" opacity=".55" />
        <circle cx="12" cy="20" r="3.4" fill="var(--color-primary-fill)" opacity=".75" />
        <circle cx="19" cy="14" r="3.8" fill="var(--color-primary-fill)" />
        <path d="M25 3l1.8 3.7 4 .6-2.9 2.8.7 4L25 12.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="var(--color-star)" />
      </svg>
    </span>
    <span class="type-section text-ink tabular-nums">{{ streak }}</span>
    <span class="type-small text-ink font-bold">üst üste</span>
    <span v-if="multiplier > 1" class="bg-primary-fill text-on-primary type-small rounded-full px-2 font-bold">×{{ multiplier }}</span>
    <span v-if="shield" class="text-ink flex items-center gap-1" title="Kalkan: bir yanlışı yutar">
      <Shield :size="20" aria-hidden="true" />
      <span class="type-small font-bold">kalkan</span>
    </span>
    <span class="sr-only">Seri: {{ streak }} doğru üst üste{{ multiplier > 1 ? `, çarpan ${multiplier}` : '' }}{{ shield ? ', kalkan hazır' : '' }}</span>
  </div>
</template>

<style scoped>
.tier-1 {
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-primary-fill) 18%, transparent);
}
.tier-2 {
  box-shadow:
    0 0 0 4px color-mix(in oklab, var(--color-primary-fill) 22%, transparent),
    0 0 0 9px color-mix(in oklab, var(--color-primary-fill) 12%, transparent);
}
.tier-3 {
  box-shadow:
    0 0 0 4px color-mix(in oklab, var(--color-primary-fill) 26%, transparent),
    0 0 0 9px color-mix(in oklab, var(--color-star) 30%, transparent),
    0 0 0 14px color-mix(in oklab, var(--color-primary-fill) 10%, transparent);
}
.animate-soft {
  animation: streak-soft 450ms var(--ease-standard) both;
}
@keyframes streak-soft {
  from {
    opacity: 0.35;
    transform: scale(0.85);
  }
}
</style>
