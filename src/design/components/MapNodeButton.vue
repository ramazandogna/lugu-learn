<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from 'rei-kit'
import { Check, Lock, Play, RotateCcw } from 'lucide-vue-next'

import type { MapNode } from '../map-layout'

/*
 * One stop on the learning map. State is carried three ways — shape/colour,
 * an icon, and words under the title — never colour alone. A locked stop is
 * still a working button: pressing it asks the page to explain why it is
 * closed (`locked` on the map), so it is neither disabled nor faded.
 */
const { node, current, numberLabel, stateLabel, currentLabel } = defineProps<{
  node: MapNode
  current: boolean
  numberLabel: string
  stateLabel: string
  currentLabel: string
}>()

const emit = defineEmits<{ press: [] }>()

const STONE = {
  completed: 'bg-primary text-on-primary [--stone-lip:color-mix(in_oklab,var(--color-primary)_70%,black)]',
  in_progress: 'bg-accent text-on-accent [--stone-lip:color-mix(in_oklab,var(--color-accent)_70%,black)]',
  available: 'bg-surface text-primary border-4 border-primary [--stone-lip:var(--color-primary)]',
  locked: 'bg-muted text-ink-soft [--stone-lip:var(--color-hair)]',
} as const

const icon = computed(() => ({ completed: Check, in_progress: Play, available: Play, locked: Lock })[node.state])
</script>

<template>
  <BaseButton
    variant="unstyled"
    class="lugu-stop group flex w-full flex-col items-center gap-1.5 rounded-card text-center"
    :aria-current="current ? 'step' : undefined"
    :data-state="node.state"
    @click="emit('press')"
  >
    <span class="relative">
      <span v-if="current" class="animate-glow absolute inset-0 rounded-full" aria-hidden="true" />
      <span
        class="lugu-stone relative flex size-[4.5rem] items-center justify-center rounded-full transition-[translate] duration-(--duration-fast) group-active:translate-y-1"
        :class="STONE[node.state]"
      >
        <component :is="icon" class="size-8" :stroke-width="2.6" aria-hidden="true" />
      </span>
      <span
        v-if="node.state === 'completed'"
        class="bg-surface text-ink absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-(--color-hair)"
        aria-hidden="true"
      >
        <RotateCcw class="size-4" :stroke-width="2.6" />
      </span>
    </span>
    <!-- A ground under the words, so the trail never runs through them. -->
    <span class="rounded-control mt-1 flex flex-col items-center bg-[color-mix(in_oklab,var(--color-canvas)_90%,transparent)] px-2 py-0.5">
      <span class="type-eyebrow text-ink-soft">{{ numberLabel }}</span>
      <span class="text-ink line-clamp-2 text-sm leading-tight font-extrabold">{{ node.title }}</span>
    </span>
    <span
      class="bg-surface rounded-full px-2 py-0.5 text-xs font-bold shadow-(--shadow-card)"
      :class="node.state === 'locked' ? 'text-ink-soft' : 'text-ink'"
    >
      {{ stateLabel }}<span v-if="current" class="sr-only"> — {{ currentLabel }}</span>
    </span>
  </BaseButton>
</template>

<style scoped>
.lugu-stone {
  box-shadow: 0 5px 0 0 var(--stone-lip);
}

.group:active .lugu-stone {
  box-shadow: 0 1px 0 0 var(--stone-lip);
}

/* A locked stop does not sink: it opens nothing, so it should not feel pressed. */
.lugu-stop[data-state='locked'] .lugu-stone {
  translate: none;
  box-shadow: 0 5px 0 0 var(--stone-lip);
}
</style>
