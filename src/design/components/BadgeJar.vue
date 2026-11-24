<script setup lang="ts">
import { Lock, Trophy } from 'lucide-vue-next'

/*
 * One badge as a jar on the library shelf. Earned = a lit jar with a star lid
 * and a trophy; ahead = a muted jar with a lock. The state is in the words
 * next to it too (the parent writes the title and "(henüz kazanılmadı)").
 */
const { earned, size = 72 } = defineProps<{ earned: boolean; size?: number }>()
const BODY = 'M10 13h28c3 0 5 3 5 6v27a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8V19c0-3 2-6 5-6z'
</script>

<template>
  <span class="relative inline-grid place-items-center" :style="{ width: `${size}px`, height: `${(size * 56) / 48}px` }" aria-hidden="true">
    <svg viewBox="0 0 48 56" class="absolute inset-0 size-full overflow-visible" focusable="false">
      <path :d="BODY" :fill="earned ? 'var(--color-wash)' : 'var(--color-muted)'" :stroke="earned ? 'var(--color-ink)' : 'var(--color-ink-soft)'" stroke-width="2.4" stroke-linejoin="round" :stroke-dasharray="earned ? undefined : '4 3'" />
      <rect x="11" y="3" width="26" height="8" rx="3" :fill="earned ? 'var(--color-star)' : 'var(--color-hair)'" :stroke="earned ? 'var(--color-ink)' : 'var(--color-ink-soft)'" stroke-width="2" />
    </svg>
    <Trophy v-if="earned" class="text-accent-ink relative mt-3" :size="size * 0.4" :stroke-width="2.2" />
    <Lock v-else class="text-ink-soft relative mt-3" :size="size * 0.36" :stroke-width="2.2" />
  </span>
</template>
