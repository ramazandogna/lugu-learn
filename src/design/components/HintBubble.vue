<script setup lang="ts">
import { Lightbulb, X } from 'lucide-vue-next'

/*
 * A hint: a plain surface with a coloured strip on the start edge (the
 * character's, via --bubble-edge). Never gives the answer away, never more than
 * two sentences, always closable. `level` 2 is the stronger hint.
 */
const { level = 1, closeLabel = 'İpucunu kapat', closable = true } = defineProps<{
  level?: 1 | 2
  closeLabel?: string
  closable?: boolean
}>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div
    role="status"
    class="surface rounded-card flex items-start gap-3 border-s-4 border-s-(--bubble-edge,var(--color-primary)) p-4"
  >
    <Lightbulb :size="20" :stroke-width="2" class="text-warning-ink mt-0.5 shrink-0" aria-hidden="true" />
    <div class="type-body text-ink min-w-0 flex-1">
      <p class="type-eyebrow text-ink-soft mb-1">{{ level === 2 ? 'Büyük ipucu' : 'İpucu' }}</p>
      <slot />
    </div>
    <button
      v-if="closable"
      type="button"
      class="focus-ring text-ink-soft hover:text-ink rounded-control -m-2 grid size-11 shrink-0 place-items-center"
      :aria-label="closeLabel"
      @click="emit('close')"
    >
      <X :size="20" :stroke-width="2" aria-hidden="true" />
    </button>
  </div>
</template>
