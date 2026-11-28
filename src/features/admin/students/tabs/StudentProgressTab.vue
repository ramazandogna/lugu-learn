<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseCard, BaseTable, ProgressBar, StatCard } from 'rei-kit'
import type { LearningData, StudentSummary } from '@/lib/api/admin'
import { formatPercent } from '../../lib/format'
import { LEVEL_ICON, LEVEL_TEXT_CLASS, LEVEL_TONE, weekSummary } from '../../lib/insights'
import { mergedLabels } from '../../lib/package-labels'
import EmptyState from '../../components/AdminEmpty.vue'
import ExpertTab from '../expert/ExpertTab.vue'
import LessonJourney from './LessonJourney.vue'
import StudentTimelineTab from './StudentTimelineTab.vue'

const { student, data } = defineProps<{ student: StudentSummary; data: LearningData }>()

const labels = computed(() => mergedLabels([...data.packages.values()].map((p) => p.content)))
const completedLessons = computed(() => new Set(data.completions.map((c) => c.lesson_id)).size)
const mastered = computed(() => data.mastery.filter((m) => m.mastered_at).length)
const recentAccuracy = computed(() => {
  const last = data.attempts.slice(0, 25)
  return last.length ? last.filter((a) => a.correct).length / last.length : null
})

const week = computed(() =>
  weekSummary({
    sessions: data.sessions.map((s) => ({ startedAt: s.started_at, activeSeconds: s.active_seconds })),
    completions: data.completions.map((c) => ({ completedAt: c.completed_at })),
    assessments: data.assessments.map((a) => ({ submittedAt: a.submitted_at, percent: a.percent })),
  }),
)

const vocabRows = computed(() =>
  [...data.mastery]
    .sort((a, b) => b.incorrect_count - a.incorrect_count || a.item_id.localeCompare(b.item_id))
    .map((m) => ({
      id: `${m.package_id}:${m.item_id}`,
      item: labels.value.vocab.get(m.item_id) ?? m.item_id,
      correct: m.correct_count,
      incorrect: m.incorrect_count,
      state: m.mastered_at ? 'Öğrenildi' : 'Çalışılıyor',
      struggling: m.incorrect_count >= 3 && !m.mastered_at,
    })),
)

const showExpert = ref(false)
</script>

<template>
  <div class="flex flex-col gap-6">
    <BaseCard as="section" aria-labelledby="pr-week">
      <template #head><h2 id="pr-week" class="type-body font-semibold">Bu hafta nasıl gidiyor?</h2></template>
      <div class="flex flex-wrap items-center gap-2">
        <component :is="LEVEL_ICON[week.level]" :size="18" class="shrink-0" :class="LEVEL_TEXT_CLASS[week.level]" aria-hidden="true" />
        <BaseBadge :tone="LEVEL_TONE[week.level]">{{ week.label }}</BaseBadge>
      </div>
      <p class="type-body mt-2">{{ week.line }}</p>
    </BaseCard>

    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Tamamlanan ders" :value="String(completedLessons)" />
      <StatCard label="Öğrenilen kelime" :value="`${mastered}/${data.mastery.length}`" />
      <StatCard label="Değerlendirme" :value="String(data.assessments.length)" />
      <StatCard label="Son doğruluk (25 yanıt)" :value="formatPercent(recentAccuracy)" />
    </div>

    <LessonJourney :student-id="student.id" :data="data" />

    <BaseCard as="section" aria-labelledby="pr-vocab">
      <template #head>
        <h2 id="pr-vocab" class="type-body font-semibold">Kelime ustalığı</h2>
        <ProgressBar v-if="data.mastery.length" class="mt-2" :value="mastered" :max="data.mastery.length" label="Öğrenilen kelimeler" />
      </template>
      <EmptyState v-if="!vocabRows.length" title="Henüz kelime çalışması yok" />
      <BaseTable
        v-else
        caption="Kelimeler, en çok hata yapılandan başlayarak"
        caption-hidden
        row-key="id"
        :rows="vocabRows"
        :columns="[
          { key: 'item', label: 'Kelime' },
          { key: 'correct', label: 'Son hatadan beri doğru', align: 'end' },
          { key: 'incorrect', label: 'Hata', align: 'end' },
          { key: 'state', label: 'Durum' },
        ]"
      >
        <template #item="{ row }">
          <span :class="row.struggling ? 'bg-wash text-ink font-semibold' : ''">{{ row.item }}</span>
        </template>
        <template #state="{ row }">
          <span v-if="row.struggling" class="text-warning-ink inline-flex items-center gap-1 font-semibold">
            <AlertTriangle :size="14" aria-hidden="true" /> Zorlanıyor
          </span>
          <template v-else>{{ row.state }}</template>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseCard as="section" aria-labelledby="pr-timeline">
      <template #head><h2 id="pr-timeline" class="type-body font-semibold">Zaman çizelgesi</h2></template>
      <StudentTimelineTab :student-id="student.id" :data="data" />
    </BaseCard>

    <BaseCard as="section" aria-labelledby="pr-expert">
      <template #head><h2 id="pr-expert" class="type-body font-semibold">Uzman analizi</h2></template>
      <ExpertTab v-if="showExpert" :student-id="student.id" />
      <BaseButton v-else variant="secondary" @click="showExpert = true">Uzman analizini göster</BaseButton>
    </BaseCard>
  </div>
</template>
