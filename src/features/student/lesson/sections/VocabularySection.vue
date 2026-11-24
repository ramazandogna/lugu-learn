<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'
import { RotateCw } from 'lucide-vue-next'

import { CharacterBubble } from '@/design'

import { useLesson } from '../context'

/*
 * Flashcards: meet each word, not a quiz. Flip for the meaning, read the
 * example, go on. Done once every card has been seen (flipped).
 */
const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean }>()
const emit = defineEmits<{ state: [s: unknown]; complete: [] }>()
const ctx = useLesson()
const items = ctx.pkg.vocabulary

function restore() {
  const s = snapshot as { v?: number; index?: number; seen?: unknown } | undefined
  const ids = new Set(items.map((i) => i.id))
  const seen = Array.isArray(s?.seen) ? s.seen.filter((x): x is string => typeof x === 'string' && ids.has(x)) : []
  const index = typeof s?.index === 'number' && s.index >= 0 && s.index < items.length ? s.index : 0
  return { index, seen: new Set(seen) }
}
const start = restore()
const index = ref(start.index)
const seen = ref(start.seen)
const flipped = ref(false)

const item = computed(() => items[index.value]!)
const allSeen = computed(() => completed || seen.value.size >= items.length)

function save() {
  emit('state', { v: 1, index: index.value, seen: [...seen.value] })
}
function flip() {
  flipped.value = !flipped.value
  if (flipped.value && !seen.value.has(item.value.id)) {
    seen.value = new Set([...seen.value, item.value.id])
    save()
  }
}
function goTo(i: number) {
  index.value = Math.max(0, Math.min(items.length - 1, i))
  flipped.value = false
  save()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <CharacterBubble character="piko" size="sm">Yeni kelimelerle tanışalım! Kartı çevir, anlamına ve örnek cümleye bak.</CharacterBubble>
    <ProgressBar :value="seen.size" :max="items.length" :label="`${items.length} kelimeden ${seen.size} tanesini gördün`" />

    <button
      type="button"
      class="surface surface-interactive rounded-card flex min-h-56 w-full flex-col items-center justify-center gap-3 p-6 text-center"
      :aria-pressed="flipped"
      :aria-label="flipped ? `${item.en}: ${item.tr}. Örnek: ${item.example.en}` : `${item.en}. Anlamını görmek için kartı çevir.`"
      @click="flip"
    >
      <span class="type-eyebrow text-ink-soft">Kelime {{ index + 1 }} / {{ items.length }}</span>
      <span class="type-title text-ink" lang="en">{{ item.en }}</span>
      <template v-if="flipped">
        <span class="type-task text-ink">{{ item.tr }}</span>
        <span class="text-ink" lang="en">“{{ item.example.en }}”</span>
        <span class="text-ink-soft type-small">{{ item.example.tr }}</span>
        <span v-if="item.context" class="text-ink-soft type-small">{{ item.context }}</span>
      </template>
      <span v-else class="text-ink-soft flex items-center gap-1 type-small"><RotateCw :size="16" aria-hidden="true" /> Çevirmek için dokun</span>
    </button>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <BaseButton variant="secondary" :disabled="index === 0" @click="goTo(index - 1)">Önceki</BaseButton>
      <BaseButton v-if="index < items.length - 1" @click="goTo(index + 1)">Sonraki kelime</BaseButton>
      <BaseButton v-else :disabled="!allSeen" @click="emit('complete')">Kelimeleri bitirdim</BaseButton>
    </div>
    <p v-if="index === items.length - 1 && !allSeen" class="text-ink-soft type-small">Bitirmeden önce her kartı bir kez çevirmelisin.</p>
  </div>
</template>
