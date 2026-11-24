<script setup lang="ts">
import { computed } from 'vue'
import { BarChart, BaseCard, BaseTable, DonutChart, EmptyState } from 'rei-kit'
import { classifySignals, questionStats, vocabDifficulty } from '@/domain/analytics'
import type { LearningData } from '@/lib/api/admin'
import { formatDuration, formatPercent, sectionLabel } from '../lib/format'
import { summariseSections, toAnalyticsInput } from '../lib/analytics-input'
import { labelFor, mergedLabels } from '../lib/package-labels'

const { data, scope } = defineProps<{ data: LearningData; scope: 'student' | 'lesson' }>()

const input = computed(() => toAnalyticsInput(data))
const labels = computed(() => mergedLabels([...data.packages.values()].map((p) => p.content)))
const sections = computed(() => summariseSections(input.value.sections))
const sectionBars = computed(() => sections.value.map((s) => ({ key: s.section, label: sectionLabel(s.section), value: s.avgActiveSeconds })))

const time = computed(() => {
  const sum = (k: 'active_seconds' | 'idle_seconds' | 'break_seconds') => data.sessions.reduce((s, x) => s + x[k], 0)
  return [
    { key: 'active', label: 'Etkin', value: sum('active_seconds') },
    { key: 'idle', label: 'Hareketsiz', value: sum('idle_seconds') },
    { key: 'break', label: 'Mola', value: sum('break_seconds') },
  ]
})
const FILL: Record<string, string> = { active: 'bg-primary', idle: 'bg-warning', break: 'bg-accent' }
const totalTime = computed(() => time.value.reduce((s, x) => s + x.value, 0))

const questions = computed(() =>
  questionStats(input.value.attempts)
    .slice(0, 20)
    .map((q) => ({
      id: q.questionId,
      question: labelFor(labels.value, q.questionId),
      section: sectionLabel(q.section),
      attempts: q.attempts,
      accuracy: formatPercent(q.accuracy),
      first: q.firstTryCorrect ? 'Evet' : 'Hayır',
      median: q.medianMs === null ? '—' : `${(q.medianMs / 1000).toFixed(1).replace('.', ',')} sn`,
      hints: formatPercent(q.hintRate),
    })),
)

const vocab = computed(() =>
  vocabDifficulty(input.value.vocab)
    .filter((v) => v.incorrect > 0)
    .slice(0, 20)
    .map((v, i) => ({
      key: `${v.itemId}-${i}`,
      item: labels.value.vocab.get(v.itemId) ?? v.itemId,
      incorrect: v.incorrect,
      mastered: v.mastered ? 'Öğrenildi' : 'Henüz değil',
      repeated: v.repeatedErrors ? 'Tekrarlayan hata' : '',
    })),
)

const signals = computed(() =>
  classifySignals({ attempts: input.value.attempts, vocab: input.value.vocab, sessions: scope === 'student' ? input.value.sessions : undefined }),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <BaseCard as="section" aria-labelledby="an-signals">
      <template #head><h2 id="an-signals" class="type-body font-semibold">Gözlemler</h2></template>
      <ul class="flex flex-col gap-2 type-small">
        <li v-for="(s, i) in signals" :key="i" class="border-hair rounded-card border p-3">{{ s.text }}</li>
        <li v-if="!signals.length" class="text-ink-soft">Belirgin bir örüntü görülmedi.</li>
      </ul>
    </BaseCard>

    <div class="grid gap-4 lg:grid-cols-2">
      <BaseCard as="section" aria-labelledby="an-sections">
        <template #head>
          <h2 id="an-sections" class="type-body font-semibold">Bölüm başına ortalama etkin süre</h2>
          <p class="text-ink-soft type-small">{{ data.sessions.length }} oturumdan.</p>
        </template>
        <EmptyState v-if="!sectionBars.length" title="Bölüm süresi kaydı yok" />
        <template v-else>
          <BarChart :series="sectionBars" label="Bölüm başına ortalama etkin süre" :value-label="(v: number) => formatDuration(v)" />
          <BaseTable
            class="mt-3"
            caption="Bölüm süreleri"
            caption-hidden
            row-key="section"
            :rows="sections.map((s) => ({ section: sectionLabel(s.section), samples: s.samples, active: formatDuration(s.avgActiveSeconds), wall: formatDuration(s.medianDurationSeconds) }))"
            :columns="[
              { key: 'section', label: 'Bölüm' },
              { key: 'samples', label: 'Kayıt', align: 'end' },
              { key: 'active', label: 'Ort. etkin', align: 'end' },
              { key: 'wall', label: 'Ortanca toplam', align: 'end' },
            ]"
          />
        </template>
      </BaseCard>
      <BaseCard as="section" aria-labelledby="an-time">
        <template #head>
          <h2 id="an-time" class="type-body font-semibold">Zaman dağılımı</h2>
          <p class="text-ink-soft type-small">Oturumlardaki etkin, hareketsiz ve mola süreleri. Hareketsizlik oturum düzeyinde ölçülür.</p>
        </template>
        <EmptyState v-if="!totalTime" title="Süre kaydı yok" />
        <DonutChart v-else :slices="time" label="Zaman dağılımı" :value-label="(v: number) => formatDuration(v)" :fill="(s) => FILL[s.key] ?? 'bg-muted'" />
      </BaseCard>
    </div>

    <BaseCard as="section" aria-labelledby="an-q">
      <template #head><h2 id="an-q" class="type-body font-semibold">Soru doğruluğu ve yanıt süresi (en zor 20)</h2></template>
      <EmptyState v-if="!questions.length" title="Yanıt kaydı yok" />
      <BaseTable
        v-else
        caption="Sorular, en düşük doğruluktan başlayarak"
        caption-hidden
        row-key="id"
        :rows="questions"
        :columns="[
          { key: 'question', label: 'Soru' },
          { key: 'section', label: 'Bölüm' },
          { key: 'attempts', label: 'Yanıt', align: 'end' },
          { key: 'accuracy', label: 'Doğruluk', align: 'end' },
          { key: 'first', label: 'İlk denemede', align: 'end' },
          { key: 'median', label: 'Ortanca süre', align: 'end' },
          { key: 'hints', label: 'İpucu', align: 'end' },
        ]"
      />
    </BaseCard>

    <BaseCard as="section" aria-labelledby="an-v">
      <template #head><h2 id="an-v" class="type-body font-semibold">Zorlanılan kelimeler</h2></template>
      <EmptyState v-if="!vocab.length" title="Hatalı kelime yanıtı yok" />
      <BaseTable
        v-else
        caption="Kelimeler, en çok hatadan başlayarak"
        caption-hidden
        row-key="key"
        :rows="vocab"
        :columns="[
          { key: 'item', label: 'Kelime' },
          { key: 'incorrect', label: 'Hata', align: 'end' },
          { key: 'mastered', label: 'Durum' },
          { key: 'repeated', label: 'Not' },
        ]"
      />
    </BaseCard>
  </div>
</template>
