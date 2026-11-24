<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

/*
 * Admin empty state. Without an action: one compact dashed row (icon + one
 * line), so a quiet panel is not 120px of blank. With an action: a short
 * block that leads to the next step, button first-class.
 */
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div
    v-if="!$slots.action"
    class="border-hair rounded-tile text-ink-soft flex min-h-14 items-center gap-3 border border-dashed px-4 py-3"
  >
    <span class="bg-muted text-ink-soft rounded-cell flex size-8 shrink-0 items-center justify-center">
      <slot name="icon"><Inbox class="size-4" aria-hidden="true" /></slot>
    </span>
    <div class="min-w-0">
      <p class="text-ink type-small font-semibold">{{ title }}</p>
      <p v-if="description" class="type-small">{{ description }}</p>
    </div>
  </div>
  <div v-else class="border-hair rounded-card bg-surface flex flex-col items-center gap-3 border border-dashed px-6 py-8 text-center">
    <span class="bg-muted text-primary rounded-tile flex size-10 items-center justify-center">
      <slot name="icon"><Inbox class="size-5" aria-hidden="true" /></slot>
    </span>
    <div>
      <p class="text-ink font-semibold">{{ title }}</p>
      <p v-if="description" class="text-ink-soft type-small mx-auto mt-1 max-w-[44ch]">{{ description }}</p>
    </div>
    <div class="flex flex-wrap justify-center gap-2"><slot name="action" /></div>
  </div>
</template>
