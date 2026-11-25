<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

import { LuguMascot, WaxSeal } from '@/design'

/*
 * C2: the card that rises when a section opens. "Bölüm 3/6 · Kelimeler", one
 * goal sentence and a line from Piko. Closes by itself after `ms` (1200, 700
 * later on) or on any tap; it never takes focus and never blocks the page
 * above it.
 */
const { index, total, label, goal, line, ms } = defineProps<{ index: number; total: number; label: string; goal: string; line: string; ms: number }>()
const emit = defineEmits<{ done: [] }>()

let t: ReturnType<typeof setTimeout> | undefined
onMounted(() => (t = setTimeout(() => emit('done'), ms)))
onBeforeUnmount(() => clearTimeout(t))
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]" style="z-index: var(--z-overlay)">
    <button
      type="button"
      class="sic surface rounded-shell focus-ring pointer-events-auto flex w-full max-w-md items-center gap-3 border-2 border-primary p-3 text-start shadow-(--shadow-card)"
      :aria-label="`Bölüm ${index} / ${total}: ${label}. ${goal} Kapatmak için dokun.`"
      @click="emit('done')"
    >
      <WaxSeal :size="40" />
      <span class="min-w-0 flex-1">
        <span class="type-eyebrow text-ink-soft block">Bölüm {{ index }}/{{ total }} · {{ label }}</span>
        <span class="type-task text-ink block">{{ goal }}</span>
        <span class="type-small text-ink-soft block">{{ line }}</span>
      </span>
      <LuguMascot character="piko" expression="happy" :size="44" />
    </button>
  </div>
</template>

<style scoped>
.sic {
  animation: sic-up var(--duration-slow) var(--ease-sheet) both;
}
@keyframes sic-up {
  from {
    transform: translateY(110%);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sic {
    animation: none;
  }
}
</style>
