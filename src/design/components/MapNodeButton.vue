<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from 'rei-kit'
import { Lock, Play, RotateCcw } from 'lucide-vue-next'

import type { MapNode } from '../map-layout'
import WaxSeal from './WaxSeal.vue'

/*
 * One stop on the learning map. State is carried three ways — shape/colour,
 * an icon, and words under the title — never colour alone. A locked stop is
 * still a working button: pressing it asks the page to explain why it is
 * closed (`locked` on the map), so it is neither disabled nor faded.
 */
const { node, current, numberLabel, stateLabel, currentLabel, fresh = false } = defineProps<{
  node: MapNode
  current: boolean
  numberLabel: string
  stateLabel: string
  currentLabel: string
  /** Just opened: a wax seal on the jar cracks away once. */
  fresh?: boolean
}>()

const emit = defineEmits<{ press: [] }>()

/* The jar silhouette's colours per state: body fill, edge, and the icon's ink. */
const JAR = {
  completed: { fill: 'var(--color-primary-fill)', edge: 'var(--color-ink)', ink: 'text-on-primary' },
  in_progress: { fill: 'var(--color-accent)', edge: 'var(--color-ink)', ink: 'text-on-accent' },
  available: { fill: 'var(--color-surface)', edge: 'var(--color-primary)', ink: 'text-primary' },
  locked: { fill: 'var(--color-muted)', edge: 'var(--color-ink-soft)', ink: 'text-ink-soft' },
} as const

const icon = computed(() => ({ completed: Play, in_progress: Play, available: Play, locked: Lock })[node.state])
const BODY = 'M22 24h52c6 0 10 5 10 11v38c0 11-8 17-17 17H29c-9 0-17-6-17-17V35c0-6 4-11 10-11z'
</script>

<template>
  <BaseButton
    variant="unstyled"
    class="lugu-stop group flex w-full flex-col items-center gap-1 rounded-card text-center"
    :aria-current="current ? 'step' : undefined"
    :data-state="node.state"
    @click="emit('press')"
  >
    <span class="relative">
      <span v-if="current" class="animate-pulse-ring bg-primary-fill/40 absolute inset-0 rounded-full" aria-hidden="true" />
      <span class="lugu-stone relative grid size-(--node-size) place-items-center transition-[translate] duration-(--duration-fast) group-active:translate-y-1">
        <svg viewBox="0 0 96 104" class="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false">
          <path :d="BODY" :fill="JAR[node.state].fill" :stroke="JAR[node.state].edge" stroke-width="5" stroke-linejoin="round" />
          <rect x="24" y="4" width="48" height="18" rx="7" :fill="node.state === 'locked' ? 'var(--color-hair)' : 'var(--color-star)'" :stroke="JAR[node.state].edge" stroke-width="5" />
          <path d="M26 44v22" stroke="var(--color-surface)" stroke-width="5" stroke-linecap="round" opacity="0.55" />
        </svg>
        <component :is="icon" v-if="node.state !== 'completed'" class="relative mt-3 size-8" :class="JAR[node.state].ink" :stroke-width="2.6" aria-hidden="true" />
        <WaxSeal v-else :size="40" class="relative mt-3" />
        <span v-if="fresh" class="seal-crack absolute inset-0 grid place-items-center" aria-hidden="true">
          <svg viewBox="0 0 32 32" class="size-12">
            <path d="M16 1.5l3 2.3 3.7-.8 1.9 3.3 3.8.5.4 3.8 3.1 2.2-1.3 3.6 1.3 3.6-3.1 2.2-.4 3.8-3.8.5-1.9 3.3-3.7-.8-3 2.3-3-2.3-3.7.8-1.9-3.3-3.8-.5-.4-3.8-3.1-2.2L3.5 16 2.2 12.4l3.1-2.2.4-3.8 3.8-.5 1.9-3.3 3.7.8z" fill="var(--color-ink-soft)" stroke="var(--color-ink)" stroke-width="1.2" stroke-linejoin="round" />
            <path d="M12 8l5 6-4 3 5 7" fill="none" stroke="var(--color-canvas)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </span>
      <span
        v-if="node.state === 'completed'"
        class="bg-surface text-ink absolute -right-2 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-(--color-hair)"
        aria-hidden="true"
      >
        <RotateCcw class="size-4" :stroke-width="2.6" />
      </span>
    </span>
    <!-- Title and state share one ground, so the trail never runs through them. -->
    <span class="rounded-control mt-1 flex flex-col items-center gap-0.5 bg-[color-mix(in_oklab,var(--color-canvas)_94%,transparent)] px-2 py-1">
      <span class="type-eyebrow text-ink-soft">{{ numberLabel }}</span>
      <span class="text-ink line-clamp-2 type-small leading-tight font-extrabold">{{ node.title }}</span>
      <span class="type-small font-bold" :class="node.state === 'locked' ? 'text-ink-soft' : 'text-primary'">
        {{ stateLabel }}<span v-if="current" class="sr-only"> — {{ currentLabel }}</span>
      </span>
    </span>
  </BaseButton>
</template>

<style scoped>
.lugu-stone {
  filter: drop-shadow(0 var(--lip-lg) 0 color-mix(in oklab, var(--color-ink) 22%, transparent));
}

.group:active .lugu-stone {
  filter: drop-shadow(0 1px 0 color-mix(in oklab, var(--color-ink) 22%, transparent));
}

/* D3: the old seal swells a little, cracks, and flies apart (420 ms, once). */
.seal-crack {
  pointer-events: none;
  animation: seal-crack var(--duration-slower) var(--ease-sheet) 300ms both;
}
@keyframes seal-crack {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  35% {
    transform: scale(1.1) rotate(-6deg);
    opacity: 1;
  }
  100% {
    transform: scale(1.7) rotate(16deg);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .seal-crack {
    display: none;
  }
}

/* A locked stop does not sink: it opens nothing, so it should not feel pressed. */
.lugu-stop[data-state='locked'] .lugu-stone {
  translate: none;
}
</style>
