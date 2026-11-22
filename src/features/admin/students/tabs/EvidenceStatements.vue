<script setup lang="ts">
import { BaseBadge } from 'rei-kit'
import type { EvidencedStatement, ObservedFact } from '@/domain/insights'

const { statements, facts } = defineProps<{
  statements: readonly (EvidencedStatement & { kind?: string })[]
  facts: readonly ObservedFact[]
}>()

const KIND: Record<string, string> = {
  strength: 'Güçlü yön',
  weakness: 'Gelişim alanı',
  repeated_error: 'Tekrarlayan hata',
  mastered_skill: 'Kazanılmış beceri',
  unmastered_skill: 'Henüz kazanılmamış',
  learning_preference: 'Öğrenme tercihi',
  trend: 'Eğilim',
  next_step: 'Sonraki adım',
  improvement: 'Gelişme',
  decline: 'Düşüş',
  potential_weakness: 'Olası zayıf alan',
  study_recommendation: 'Çalışma önerisi',
  coaching_question: 'Koçluk sorusu',
}
const CONFIDENCE: Record<string, string> = { low: 'düşük güven', medium: 'orta güven', high: 'yüksek güven' }

function evidenceLabel(key: string): string {
  if (key === 'teacher.profile') return 'Öğretmen gözlemi'
  if (key.startsWith('teacher.')) return 'Öğretmen notu'
  return facts.find((f) => f.key === key)?.label ?? key
}
</script>

<template>
  <ul class="flex flex-col gap-3">
    <li v-for="(s, i) in statements" :key="i" class="border-hair rounded-card border p-3">
      <div class="flex flex-wrap items-center gap-2">
        <BaseBadge v-if="s.kind" tone="primary">{{ KIND[s.kind] ?? s.kind }}</BaseBadge>
        <BaseBadge>{{ CONFIDENCE[s.confidence] }}</BaseBadge>
      </div>
      <p class="mt-2">{{ s.text }}</p>
      <p class="text-ink-soft mt-1 text-xs">Dayanak: {{ s.evidence.map(evidenceLabel).join(' · ') }}</p>
    </li>
  </ul>
</template>
