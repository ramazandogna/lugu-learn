<script setup lang="ts">
import { Check } from 'lucide-vue-next'

/*
 * Balmumu mühür: a scalloped wax disc with a tick. Decoration beside words
 * ("Doğru"), never alone. Stamps in once (animate-stamp, 420 ms; still under
 * reduced motion). Fill is the success role with its own ink, so it is not
 * colour alone: shape + tick + the word next to it.
 */
const { size = 32 } = defineProps<{ size?: number }>()
const PATH = 'M16 1.5l3 2.3 3.7-.8 1.9 3.3 3.8.5.4 3.8 3.1 2.2-1.3 3.6 1.3 3.6-3.1 2.2-.4 3.8-3.8.5-1.9 3.3-3.7-.8-3 2.3-3-2.3-3.7.8-1.9-3.3-3.8-.5-.4-3.8-3.1-2.2L3.5 16 2.2 12.4l3.1-2.2.4-3.8 3.8-.5 1.9-3.3 3.7.8z'
</script>

<template>
  <span class="animate-stamp relative inline-grid place-items-center" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <svg viewBox="0 0 32 32" :width="size" :height="size" class="absolute inset-0" focusable="false">
      <path :d="PATH" fill="var(--color-positive)" stroke="var(--color-ink)" stroke-width="1.2" stroke-linejoin="round" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="var(--color-on-positive)" stroke-opacity="0.55" stroke-width="1" />
    </svg>
    <Check class="text-on-positive relative" :size="size * 0.5" :stroke-width="3" />
  </span>
</template>
