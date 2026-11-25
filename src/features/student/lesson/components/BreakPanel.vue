<script setup lang="ts">
import { BaseButton } from 'rei-kit'

import { BreakScene, CandyButton, CharacterBubble } from '@/design'
import { BREAK_OPTIONS, type BreakMinutes, type BreakStatus } from '@/engine/break'

/*
 * Offer: "Mola ister misin?" with 0/10/15/20/30. Running: the night scene and
 * a countdown, "Erken dön". Over: "Başla" — the next section waits for it.
 */
const { status, countdown, secondsLeft, nextLabel } = defineProps<{
  status: BreakStatus | null
  countdown: string
  secondsLeft: number
  nextLabel: string
}>()
const emit = defineEmits<{ choose: [minutes: BreakMinutes]; resume: [] }>()

const label = (m: BreakMinutes) => (m === 0 ? 'Mola istemiyorum, devam' : `${m} dakika`)
const spoken = (s: number) => `${Math.floor(s / 60)} dakika ${s % 60} saniye kaldı`
</script>

<template>
  <section v-if="status === null" aria-labelledby="break-offer" class="flex flex-col gap-4">
    <h2 id="break-offer" class="type-section text-ink">Bölümü bitirdin! Mola ister misin?</h2>
    <CharacterBubble character="dora" size="sm">Biraz su içmek, gözlerini dinlendirmek iyi gelir. Sıradaki bölüm: {{ nextLabel }}.</CharacterBubble>
    <div class="grid gap-2 sm:grid-cols-3" role="group" aria-label="Mola süresi">
      <template v-for="m in BREAK_OPTIONS" :key="m">
        <CandyButton v-if="m === 0" block @click="emit('choose', m)">{{ label(m) }}</CandyButton>
        <BaseButton v-else variant="secondary" size="lg" @click="emit('choose', m)">{{ label(m) }}</BaseButton>
      </template>
    </div>
  </section>

  <BreakScene
    v-else
    :title="status === 'running' ? 'Mola zamanı' : 'Mola bitti!'"
    :message="status === 'running' ? 'Dinlen, esne, biraz hareket et. Hazır olduğunda geri dönebilirsin.' : 'Hazır olduğunda Başla düğmesine bas. Ders seni bekliyor, acele yok.'"
  >
    <template #countdown>
      <p class="type-eyebrow text-ink-soft">Kalan süre</p>
      <p class="font-display text-ink type-display font-semibold tabular-nums" aria-hidden="true">{{ countdown }}</p>
      <!-- Announced once a minute, not every second. -->
      <p class="sr-only" aria-live="polite">{{ secondsLeft % 60 === 0 || secondsLeft === 0 ? spoken(secondsLeft) : '' }}</p>
    </template>
    <template #actions>
      <BaseButton v-if="status === 'running'" size="lg" variant="secondary" @click="emit('resume')">Erken dön</BaseButton>
      <CandyButton v-else @click="emit('resume')">Başla</CandyButton>
    </template>
  </BreakScene>
</template>
