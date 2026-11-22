<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from 'vue'

import { move, place, unplace, type OrderState } from '@/engine/order'

/*
 * Tap-to-place sentence ordering. Tap (or Enter/Space) a word in the pool to
 * add it to the sentence; tap a placed word to send it back. With a placed
 * word focused, ←/→ move it inside the sentence. No dragging needed.
 */
const { state, disabled = false, label } = defineProps<{ state: OrderState; disabled?: boolean; label: string }>()
const emit = defineEmits<{ update: [state: OrderState] }>()

const placedRefs = useTemplateRef<HTMLButtonElement[]>('placed')
const sentence = computed(() => state.placed.map((t) => t.text).join(' '))

function add(i: number) {
  if (!disabled) emit('update', place(state, i))
}
function remove(i: number) {
  if (!disabled) emit('update', unplace(state, i))
}
async function shift(i: number, by: -1 | 1) {
  const to = i + by
  if (disabled || to < 0 || to >= state.placed.length) return
  emit('update', move(state, i, to))
  await nextTick()
  placedRefs.value?.[to]?.focus()
}
</script>

<template>
  <div class="flex flex-col gap-3" role="group" :aria-label="label">
    <div class="rounded-card border-hair bg-wash flex min-h-16 flex-wrap items-center gap-2 border-2 border-dashed p-3">
      <span v-if="!state.placed.length" class="text-ink-soft text-sm">Kelimelere dokunarak cümleni kur.</span>
      <button
        v-for="(t, i) in state.placed"
        :key="t.id"
        ref="placed"
        type="button"
        class="control rounded-control focus-ring text-ink min-h-11 px-3 py-2 font-bold"
        :disabled="disabled"
        :aria-label="`${t.text}, ${i + 1}. sırada. Geri almak için seç, yerini değiştirmek için sol ve sağ ok tuşlarını kullan.`"
        @click="remove(i)"
        @keydown.left.prevent="shift(i, -1)"
        @keydown.right.prevent="shift(i, 1)"
      >
        {{ t.text }}
      </button>
    </div>
    <div class="flex flex-wrap gap-2" aria-label="Kullanılabilir kelimeler" role="group">
      <button
        v-for="(t, i) in state.pool"
        :key="t.id"
        type="button"
        class="control rounded-control focus-ring text-ink min-h-11 px-3 py-2"
        :disabled="disabled"
        :aria-label="`${t.text} kelimesini cümleye ekle`"
        @click="add(i)"
      >
        {{ t.text }}
      </button>
    </div>
    <p class="sr-only" aria-live="polite">{{ sentence ? `Cümlen: ${sentence}` : '' }}</p>
  </div>
</template>
