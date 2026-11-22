<script setup lang="ts">
import type { CharacterKey } from '@/domain/content'

import { CHARACTERS, characterThemeStyle } from '../characters'
import type { Expression } from '../mascots'
import LuguMascot from './LuguMascot.vue'

/*
 * A character speaking. The bubble is a real surface on the character's wash,
 * with ink text — never coloured text on a wash. The name is shown so the
 * speaker is clear without the picture; the mascot itself is decoration.
 */
const {
  character,
  expression = 'happy',
  side = 'start',
  size = 'md',
  showName = true,
  live = false,
  animated = false,
} = defineProps<{
  character: CharacterKey
  expression?: Expression
  /** Which side the character stands on. */
  side?: 'start' | 'end'
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  /** Announce changes politely (feedback after an answer). */
  live?: boolean
  animated?: boolean
}>()

const MASCOT = { sm: 56, md: 80, lg: 112 } as const
</script>

<template>
  <div
    class="flex items-end gap-2"
    :class="side === 'end' ? 'flex-row-reverse' : ''"
    :data-character="character"
    :style="characterThemeStyle(character)"
  >
    <LuguMascot :character="character" :expression="expression" :size="MASCOT[size]" :animated="animated" />
    <div
      class="lugu-bubble rounded-card relative min-w-0 flex-1 border-2 border-(--color-accent) bg-surface px-4 py-3 shadow-(--shadow-card)"
      :class="[side === 'end' ? 'is-end' : 'is-start', size === 'sm' ? 'text-sm' : 'text-base']"
      :aria-live="live ? 'polite' : undefined"
    >
      <p v-if="showName" class="type-eyebrow text-ink-soft mb-1">{{ CHARACTERS[character].name }}</p>
      <div class="text-ink leading-relaxed">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The tail: a rotated square sharing the bubble's border, pointing at the speaker. */
.lugu-bubble::before {
  content: '';
  position: absolute;
  bottom: 1.1rem;
  width: 0.9rem;
  height: 0.9rem;
  background: var(--color-surface);
  border: 2px solid var(--color-accent);
  border-top-color: transparent;
  border-right-color: transparent;
  transform: rotate(45deg);
}

.is-start::before {
  inset-inline-start: -0.5rem;
}

.is-end::before {
  inset-inline-end: -0.5rem;
  transform: rotate(-135deg);
}
</style>
