<script setup lang="ts" generic="V extends string | number">
import { computed, watch } from 'vue'
import { Check, RotateCcw } from 'lucide-vue-next'

import { playSound } from '../sound'
import WaxSeal from './WaxSeal.vue'

/*
 * One answer, as a wax-seal card (Balmumu Mühür). A real radio sits inside,
 * visually hidden, so keyboard and screen readers get radio semantics; wrap a
 * set in <fieldset> (role radiogroup) with a legend. State is never colour
 * alone: the seal carries an icon and a word.
 *
 *   idle      surface + field-edge, 2px
 *   selected  primary 2px edge + wash (before checking)
 *   correct   the right option after an answer: green ground, Check, "Doğru"
 *   wrong     the learner's own wrong pick: retry wash, RotateCcw, "Senin seçimin"
 *             (not red, no shake: it fades in 300 ms)
 *   dim       the others once answered
 */
const { value, name, result, disabled = false, correctLabel = 'Doğru', pickedLabel = 'Senin seçimin' } = defineProps<{
  value: V
  name: string
  /** Set after the answer is graded; leave undefined while choosing. */
  result?: 'correct' | 'wrong' | 'dim'
  disabled?: boolean
  correctLabel?: string
  pickedLabel?: string
}>()
const model = defineModel<V | null>({ default: null })

const selected = computed(() => model.value === value)

watch(
  () => result,
  (r, prev) => {
    if (prev || !r) return
    if (r === 'correct') playSound('dogru')
    else if (r === 'wrong') playSound('yanlis-yumusak')
  },
)

function onChange() {
  playSound('tik')
}
</script>

<template>
  <label
    class="stamp rounded-control relative flex min-h-14 items-center gap-3 border-2 px-4 py-2 select-none"
    :class="[
      result === 'correct'
        ? 'border-positive bg-positive/12'
        : result === 'wrong'
          ? 'bg-retry-wash border-primary'
          : result === 'dim'
            ? 'border-field-edge bg-surface opacity-60'
            : selected
              ? 'border-primary bg-wash'
              : 'border-field-edge bg-surface',
      !result && !disabled ? 'stamp-live cursor-pointer' : '',
      result === 'wrong' ? 'animate-fade' : '',
    ]"
  >
    <input
      v-model="model"
      type="radio"
      class="peer sr-only"
      :name="name"
      :value="value"
      :disabled="disabled || !!result"
      @change="onChange"
    />
    <span class="bead shrink-0" aria-hidden="true" />
    <span class="type-body text-ink min-w-0 flex-1"><slot /></span>
    <span
      v-if="result === 'correct' || result === 'wrong'"
      class="type-small text-ink flex shrink-0 items-center gap-1.5 font-bold" :class="result === 'wrong' ? 'animate-stamp' : ''"
    >
      <WaxSeal v-if="result === 'correct'" :size="36" />
      <span v-else class="bg-primary text-on-primary grid size-7 place-items-center rounded-full" aria-hidden="true">
        <RotateCcw :size="16" :stroke-width="2.4" />
      </span>
      {{ result === 'correct' ? correctLabel : pickedLabel }}
    </span>
    <span v-else-if="selected" class="bg-primary text-on-primary grid size-7 shrink-0 place-items-center rounded-full" aria-hidden="true">
      <Check :size="16" :stroke-width="2.4" />
    </span>
  </label>
</template>

<style scoped>
/* The wrapped-candy bead before each answer: the option is a sweet, not a box. */
.bead {
  width: 1.25rem;
  height: 0.75rem;
  border-radius: 9999px;
  background: var(--color-accent);
  border: 1.5px solid var(--color-ink-soft);
  clip-path: polygon(0 20%, 22% 38%, 78% 38%, 100% 20%, 100% 80%, 78% 62%, 22% 62%, 0 80%);
}
.stamp {
  transition:
    transform var(--duration-fast) var(--ease-pop),
    background-color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard);
}
.stamp-live:active {
  transform: scale(var(--press-scale));
}
@media (hover: hover) {
  .stamp-live:hover {
    background-color: var(--color-wash);
  }
}
/* Keyboard focus lives on the hidden radio; the ring draws on the card. */
.stamp:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.animate-fade {
  animation: stamp-fade 300ms var(--ease-standard) both;
}
@keyframes stamp-fade {
  from {
    opacity: 0.4;
  }
}
</style>
