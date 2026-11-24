<script setup lang="ts">
import { computed } from 'vue'

import LuguMark from './LuguMark.vue'

const {
  variant = 'full',
  size = 'md',
  tagline,
  suffix,
  label = 'Lugu',
} = defineProps<{
  /** `mark` alone for tight spaces (a collapsed sidebar, the favicon). */
  variant?: 'full' | 'mark'
  size?: 'sm' | 'md' | 'lg'
  /** A line under the wordmark: "Küçük adımlar, büyük hayaller." */
  tagline?: string
  /** A quiet label after the wordmark, e.g. "Yönetim" in the admin area. */
  suffix?: string
  /** Name for the mark-only variant. */
  label?: string
}>()

const mark = computed(() => ({ sm: 28, md: 36, lg: 56 })[size])
const word = computed(() => ({ sm: 'type-section', md: 'type-title', lg: 'type-hero' })[size])
</script>

<template>
  <LuguMark v-if="variant === 'mark'" :size="mark" :label="label" />
  <span v-else class="inline-flex items-center gap-2.5">
    <LuguMark :size="mark" />
    <span class="flex flex-col">
      <span class="flex items-baseline gap-2">
        <span class="font-display text-ink leading-none font-semibold tracking-tight" :class="word">lugu</span>
        <span v-if="suffix" class="text-ink-soft type-small font-bold tracking-wide uppercase">{{ suffix }}</span>
      </span>
      <span v-if="tagline" class="text-ink-soft mt-1 type-small font-semibold">{{ tagline }}</span>
    </span>
  </span>
</template>
