<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

import { CandyButton, LuguMascot, WaxSeal } from '@/design'

/*
 * C5: a finished section is sealed, four candies scatter, one honest line
 * ("3 yeni kelime öğrendin", never a mistake count) and a small "Sıradaki"
 * button. 900 ms, quiet under reduced motion. The flight of the candy to the
 * jar (C3) is the player's.
 */
const { label, line, nextLabel } = defineProps<{ label: string; line: string; nextLabel: string }>()
const emit = defineEmits<{ next: [] }>()
const btn = useTemplateRef<{ focus: () => void }>('btn')
defineExpose({ focus: () => btn.value?.focus() })
const BITS = [
  { dx: -64, dy: -34 },
  { dx: 58, dy: -42 },
  { dx: -38, dy: 30 },
  { dx: 70, dy: 22 },
]
</script>

<template>
  <section class="sd surface rounded-card relative flex flex-col items-center gap-3 overflow-hidden p-6 text-center" aria-labelledby="sd-title">
    <div class="relative grid place-items-center">
      <WaxSeal :size="72" />
      <i v-for="(b, i) in BITS" :key="i" class="sd-bit" :style="{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--n': i }" aria-hidden="true" />
    </div>
    <div role="status">
      <p class="type-eyebrow text-ink-soft">{{ label }} tamam</p>
      <h3 id="sd-title" class="type-section text-ink">{{ line }}</h3>
    </div>
    <div class="flex items-center gap-2">
      <LuguMascot character="piko" expression="celebrating" :size="48" />
      <CandyButton ref="btn" variant="drop" @click="emit('next')">Sıradaki: {{ nextLabel }} <ArrowRight :size="20" aria-hidden="true" /></CandyButton>
    </div>
  </section>
</template>

<style scoped>
.sd-bit {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.625rem;
  height: 0.625rem;
  margin: -0.3125rem;
  border-radius: 40%;
  background: var(--color-accent);
  animation: sd-bit 900ms var(--ease-pop) both;
}
.sd-bit:nth-of-type(2n) {
  background: var(--color-star);
}
.sd-bit:nth-of-type(3n) {
  background: var(--color-primary-fill);
}
@keyframes sd-bit {
  from {
    transform: translate(0, 0) scale(0.5);
    opacity: 1;
  }
  to {
    transform: translate(var(--dx), var(--dy)) scale(1);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sd-bit {
    display: none;
  }
}
</style>
