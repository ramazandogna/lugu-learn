<script setup lang="ts">
import type { CharacterKey } from '@/domain/content'

import LuguMascot from './LuguMascot.vue'
import TinyCat from './TinyCat.vue'
import WorldBackground from './WorldBackground.vue'

/*
 * The break screen's picture: a calm night scene with the host resting and a
 * cat asleep. It draws no timer of its own — the countdown slot holds the
 * page's timer (with its own live region), and the actions slot holds
 * "Erken dön" / "Başla". The next section never starts by itself.
 */
const {
  title,
  message,
  character = 'dora',
  animated = true,
} = defineProps<{
  title: string
  message?: string
  character?: CharacterKey
  animated?: boolean
}>()
</script>

<template>
  <WorldBackground
    as="section"
    :character="character"
    motif="dream"
    intensity="rich"
    :animated="animated"
    class="rounded-shell flex min-h-[28rem] flex-col items-center px-6 pt-8 pb-28 text-center sm:pb-36"
  >
    <h2 class="type-title text-ink">{{ title }}</h2>
    <p v-if="message" class="text-ink-soft mt-2 max-w-[40ch]">{{ message }}</p>
    <div class="surface-raised rounded-card mt-6 min-w-[12rem] px-8 py-4">
      <slot name="countdown" />
    </div>
    <div v-if="$slots.actions" class="mt-6 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
      <slot name="actions" />
    </div>
    <div class="pointer-events-none absolute inset-x-0 bottom-3 flex items-end justify-center gap-2" aria-hidden="true">
      <LuguMascot :character="character" expression="resting" :size="96" :animated="animated" />
      <TinyCat pose="sleep" :size="44" fur="var(--color-primary)" />
    </div>
  </WorldBackground>
</template>
