<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, ProgressBar } from 'rei-kit'
import { RotateCw } from 'lucide-vue-next'

import { CharacterBubble } from '@/design'
import type { ResolvedPlay } from '@/play/resolve-play'

import SpeakButton from '../../play/SpeakButton.vue'

import { useLesson } from '../context'

/*
 * Candy flashcards ("şeker flip"): meet each word, not a quiz. Flip the wrapped
 * candy for the meaning, hear it (when the browser can speak), go on. Done once every card has been seen (flipped).
 */
const { snapshot, completed = false } = defineProps<{ snapshot?: unknown; completed?: boolean; play?: ResolvedPlay }>()
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

    <div class="flip-scene mx-auto w-full max-w-xl px-7">
      <button
        type="button"
        class="flip focus-ring rounded-card block w-full text-center"
        :aria-pressed="flipped"
        :aria-label="flipped ? `${item.en}: ${item.tr}. Örnek: ${item.example.en}` : `${item.en}. Anlamını görmek için kartı çevir.`"
        @click="flip"
      >
        <span class="flip-inner grid" :class="flipped ? 'is-flipped' : ''">
          <span class="face candy surface rounded-card flex min-h-64 flex-col items-center justify-center gap-3 p-6" aria-hidden="true">
            <span class="type-eyebrow text-ink-soft">Kelime {{ index + 1 }} / {{ items.length }}</span>
            <span class="type-hero text-ink" lang="en">{{ item.en }}</span>
            <span class="text-ink-soft type-small flex items-center gap-1"><RotateCw :size="16" aria-hidden="true" /> Çevirmek için dokun</span>
          </span>
          <span class="face back surface rounded-card border-primary flex min-h-64 flex-col items-center justify-center gap-3 border-2 p-6" aria-hidden="true">
            <span class="type-title text-ink">{{ item.tr }}</span>
            <span class="type-task text-ink" lang="en">“{{ item.example.en }}”</span>
            <span class="text-ink-soft type-body">{{ item.example.tr }}</span>
            <span v-if="item.context" class="text-ink-soft type-small">{{ item.context }}</span>
          </span>
        </span>
      </button>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <SpeakButton :text="item.en" label="Kelimeyi dinle" />
      <SpeakButton :text="item.example.en" label="Cümleyi dinle" />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <BaseButton variant="secondary" :disabled="index === 0" @click="goTo(index - 1)">Önceki</BaseButton>
      <BaseButton v-if="index < items.length - 1" @click="goTo(index + 1)">Sonraki kelime</BaseButton>
      <BaseButton v-else :disabled="!allSeen" @click="emit('complete')">Kelimeleri bitirdim</BaseButton>
    </div>
    <p v-if="index === items.length - 1 && !allSeen" class="text-ink-soft type-small">Bitirmeden önce her kartı bir kez çevirmelisin.</p>
  </div>
</template>

<style scoped>
.flip-scene {
  perspective: 1200px;
}
.flip-inner {
  transform-style: preserve-3d;
  transition: transform var(--duration-slow) var(--ease-sheet);
}
.flip-inner.is-flipped {
  transform: rotateY(180deg);
}
.face {
  grid-area: 1 / 1;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.back {
  transform: rotateY(180deg);
}
/* wrapped-candy twists on the front face */
.candy {
  position: relative;
}
.candy::before,
.candy::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 28px;
  height: 44px;
  margin-top: -22px;
  background: var(--color-accent);
}
.candy::before {
  inset-inline-start: -26px;
  clip-path: polygon(100% 0, 0 50%, 100% 100%);
}
.candy::after {
  inset-inline-end: -26px;
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}
.flip:active .flip-inner:not(.is-flipped) {
  transform: scale(var(--press-scale));
}
@media (prefers-reduced-motion: reduce) {
  .flip-inner {
    transition: none;
  }
}
</style>
