<script setup lang="ts">
import { BaseSpinner } from 'rei-kit'

import type { CharacterKey } from '@/domain/content'

import LuguMascot from './LuguMascot.vue'

/*
 * Waiting, on brand. The spinner is rei-kit's (it keeps moving slowly under
 * reduced motion, because a loader that stops reads as a hang) and carries
 * the accessible name; the mascot is decoration. For lists and cards prefer
 * rei-kit's SkeletonList — this is for a whole page or panel.
 */
const {
  label,
  character = 'piko',
  compact = false,
} = defineProps<{
  /** What is loading, e.g. "Haritan hazırlanıyor". Visible and announced. */
  label: string
  character?: CharacterKey
  compact?: boolean
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 py-8 text-center" aria-busy="true">
    <LuguMascot :character="character" expression="thinking" :size="compact ? 72 : 112" animated />
    <div class="flex items-center gap-2">
      <BaseSpinner :label="label" size="sm" />
      <p class="text-ink-soft font-semibold" aria-hidden="true">{{ label }}</p>
    </div>
  </div>
</template>
