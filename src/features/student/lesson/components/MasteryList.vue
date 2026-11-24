<script setup lang="ts">
import { Check } from 'lucide-vue-next'

/* Each word's mastery: filled dots out of `goal`, a tick and the word "öğrenildi" when done. */
const { items, goal } = defineProps<{ items: readonly { id: string; en: string; tr: string; count: number }[]; goal: number }>()
</script>

<template>
  <section aria-labelledby="mastery-title" class="flex flex-col gap-2">
    <h3 id="mastery-title" class="type-task text-ink">Kelimelerin</h3>
    <ul class="grid gap-2 sm:grid-cols-2">
      <li v-for="it in items" :key="it.id" class="surface rounded-tile flex items-center justify-between gap-3 px-3 py-2">
        <span class="min-w-0">
          <span class="text-ink font-bold" lang="en">{{ it.en }}</span>
          <span class="text-ink-soft type-small"> · {{ it.tr }}</span>
        </span>
        <span class="flex shrink-0 items-center gap-1">
          <span class="sr-only">{{ it.count >= goal ? 'öğrenildi' : `${goal} doğrudan ${it.count}` }}</span>
          <template v-if="it.count >= goal">
            <Check :size="20" class="text-positive" aria-hidden="true" />
            <span class="text-ink type-small" aria-hidden="true">öğrenildi</span>
          </template>
          <template v-else>
            <span
              v-for="n in goal"
              :key="n"
              aria-hidden="true"
              class="size-3 rounded-full border-2"
              :class="n <= it.count ? 'border-primary bg-primary' : 'border-hair border-dashed'"
            />
          </template>
        </span>
      </li>
    </ul>
  </section>
</template>
