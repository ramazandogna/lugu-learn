<script setup lang="ts">
import { BaseBadge, BaseButton } from 'rei-kit'

import { features } from '@/lib/features'

/*
 * The button for anything that calls the AI. While VITE_AI_ENABLED is off it
 * stays focusable but does nothing (aria-disabled, no click), wears "Yakında",
 * and says so to a screen reader. One place to turn the whole lot on.
 */
defineOptions({ inheritAttrs: false })
const emit = defineEmits<{ click: [event: MouseEvent] }>()

function press(e: MouseEvent) {
  if (!features.ai) {
    e.preventDefault()
    return
  }
  emit('click', e)
}
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <BaseButton
      v-bind="$attrs"
      :aria-disabled="features.ai ? undefined : 'true'"
      :title="features.ai ? undefined : 'Yakında'"
      @click="press"
    >
      <slot />
      <span v-if="!features.ai" class="sr-only"> (Yakında)</span>
    </BaseButton>
    <BaseBadge v-if="!features.ai" tone="neutral">Yakında</BaseBadge>
  </span>
</template>
