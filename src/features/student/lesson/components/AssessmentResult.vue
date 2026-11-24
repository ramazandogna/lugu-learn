<script setup lang="ts">
import { BaseButton, ProgressBar } from 'rei-kit'

import { CharacterBubble } from '@/design'
import type { AssessmentScore } from '@/lib/database.types'

/* The server's score for the final check. Encouraging whatever the number. */
const { score } = defineProps<{ score: AssessmentScore }>()
const emit = defineEmits<{ continue: [] }>()

const line = (p: number) =>
  p >= 85 ? 'Muhteşem! Bu dersi çok iyi anladın.' : p >= 60 ? 'Çok güzel! Birkaç noktayı tekrar edersen daha da güçlenirsin.' : 'Emeğin için teşekkürler! Zorlandığın yerleri birlikte tekrar edebiliriz.'
</script>

<template>
  <section aria-labelledby="score-title" class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6">
    <h3 id="score-title" class="type-section text-ink">Değerlendirme sonucun</h3>
    <p class="type-hero text-ink">%{{ score.percent }}</p>
    <dl class="grid gap-3 sm:grid-cols-2">
      <div>
        <dt class="text-ink-soft type-small">Test</dt>
        <dd class="text-ink font-bold">{{ score.quiz_total }} sorudan {{ score.quiz_correct }} doğru</dd>
        <ProgressBar :value="score.quiz_correct" :max="Math.max(1, score.quiz_total)" size="sm" :label="`Test: ${score.quiz_total} sorudan ${score.quiz_correct} doğru`" />
      </div>
      <div>
        <dt class="text-ink-soft type-small">Okuma</dt>
        <dd class="text-ink font-bold">{{ score.reading_total }} sorudan {{ score.reading_correct }} doğru</dd>
        <ProgressBar :value="score.reading_correct" :max="Math.max(1, score.reading_total)" size="sm" :label="`Okuma: ${score.reading_total} sorudan ${score.reading_correct} doğru`" />
      </div>
    </dl>
    <CharacterBubble character="sasha" size="sm" live>{{ line(score.percent) }}</CharacterBubble>
    <BaseButton class="self-start" size="lg" @click="emit('continue')">Devam et</BaseButton>
  </section>
</template>
