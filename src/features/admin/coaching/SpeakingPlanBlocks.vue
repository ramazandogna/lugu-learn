<script setup lang="ts">
import { computed } from 'vue'
import type { SpeakingPlan } from '@/domain/content'

const { plan } = defineProps<{ plan: SpeakingPlan }>()

const blocks = computed(() => [
  { key: 'warmUp', title: 'Isınma', block: plan.warmUp },
  { key: 'vocabulary', title: 'Kelime', block: plan.vocabulary },
  { key: 'grammar', title: 'Dil bilgisi', block: plan.grammar },
  { key: 'rolePlay', title: 'Canlandırma', block: plan.rolePlay },
  { key: 'listening', title: 'Dinleme', block: plan.listening },
  { key: 'weaknessReinforcement', title: 'Zayıf alan pekiştirme', block: plan.weaknessReinforcement },
  { key: 'freeSpeaking', title: 'Serbest konuşma', block: plan.freeSpeaking },
])
const total = computed(() => blocks.value.reduce((s, b) => s + b.block.minutes, 0))
</script>

<template>
  <div>
    <p class="text-ink-soft text-sm">Toplam {{ total }} dakika</p>
    <ol class="mt-2 flex flex-col gap-3">
      <li v-for="b in blocks" :key="b.key" class="border-hair rounded-card border p-3">
        <p class="font-semibold">{{ b.title }} <span class="text-ink-soft text-sm font-normal">· {{ b.block.minutes }} dk</span></p>
        <ul class="mt-1 list-disc ps-5 text-sm">
          <li v-for="(a, i) in b.block.activities" :key="i">{{ a }}</li>
        </ul>
        <p v-if="b.key === 'listening'" class="text-ink-soft mt-2 text-sm whitespace-pre-line">Metin: {{ plan.listening.script }}</p>
      </li>
      <li class="border-hair rounded-card border p-3">
        <p class="font-semibold">Kapanış görevi</p>
        <p class="text-sm">{{ plan.closingTask.task }}</p>
      </li>
    </ol>
  </div>
</template>
