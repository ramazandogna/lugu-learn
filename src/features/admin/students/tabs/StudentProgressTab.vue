<script setup lang="ts">
import { computed } from 'vue'
import { BaseBadge, BaseCard, BaseTable, ProgressBar, StatCard } from 'rei-kit'
import type { LearningData, StudentSummary } from '@/lib/api/admin'
import { ASSIGNMENT_STATUS, formatDateTime, formatPercent, sectionLabel } from '../../lib/format'
import { labelFor, mergedLabels } from '../../lib/package-labels'
import EmptyState from '../../components/AdminEmpty.vue'

const { student, data } = defineProps<{ student: StudentSummary; data: LearningData }>()

const labels = computed(() => mergedLabels([...data.packages.values()].map((p) => p.content)))
const lessonTitle = (id: string) => data.lessons.get(id)?.title ?? 'Ders'
const completedLessons = computed(() => new Set(data.completions.map((c) => c.lesson_id)).size)
const mastered = computed(() => data.mastery.filter((m) => m.mastered_at).length)
const sessionLesson = computed(() => new Map(data.sessions.map((s) => [s.id, s.lesson_id])))

const vocabRows = computed(() =>
  [...data.mastery]
    .sort((a, b) => b.incorrect_count - a.incorrect_count || a.item_id.localeCompare(b.item_id))
    .map((m) => ({
      id: `${m.package_id}:${m.item_id}`,
      item: labels.value.vocab.get(m.item_id) ?? m.item_id,
      correct: m.correct_count,
      incorrect: m.incorrect_count,
      state: m.mastered_at ? 'Öğrenildi' : 'Çalışılıyor',
    })),
)

const assessmentRows = computed(() =>
  data.assessments.map((a) => ({
    id: a.id,
    lesson: lessonTitle(sessionLesson.value.get(a.session_id) ?? ''),
    quiz: `${a.quiz_correct}/${a.quiz_total}`,
    reading: `${a.reading_correct}/${a.reading_total}`,
    percent: `%${Math.round(a.percent)}`,
    at: formatDateTime(a.submitted_at),
  })),
)

const attemptRows = computed(() =>
  data.attempts.slice(0, 25).map((a) => ({
    id: a.id,
    question: labelFor(labels.value, a.question_id),
    section: sectionLabel(a.section),
    result: a.correct ? 'Doğru' : 'Yanlış',
    detail: [a.attempt_no > 1 ? `${a.attempt_no}. deneme` : null, a.hint_used ? 'ipucu' : null, a.response_ms !== null ? `${(a.response_ms / 1000).toFixed(1).replace('.', ',')} sn` : null]
      .filter(Boolean)
      .join(' · '),
    at: formatDateTime(a.created_at),
  })),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Tamamlanan ders" :value="String(completedLessons)" />
      <StatCard label="Öğrenilen kelime" :value="`${mastered}/${data.mastery.length}`" />
      <StatCard label="Değerlendirme" :value="String(data.assessments.length)" />
      <StatCard label="Son doğruluk (25 yanıt)" :value="formatPercent(attemptRows.length ? attemptRows.filter((r) => r.result === 'Doğru').length / attemptRows.length : null)" />
    </div>

    <BaseCard as="section" aria-labelledby="pr-current">
      <template #head><h2 id="pr-current" class="type-body font-semibold">Şu anki ders</h2></template>
      <EmptyState v-if="!student.program" title="Program atanmadı" description="Program yönetimi sekmesinden bir müfredat sürümü atayın." />
      <div v-else class="flex flex-wrap items-center gap-3">
        <p class="font-semibold">
          {{ student.program.currentLesson ? `${student.program.currentLesson.sequence}. ${student.program.currentLesson.title}` : 'Program tamamlandı' }}
        </p>
        <BaseBadge>{{ student.program.curriculumName }} · s{{ student.program.version }}</BaseBadge>
        <BaseBadge :tone="student.program.status === 'active' ? 'success' : 'warning'">{{ ASSIGNMENT_STATUS[student.program.status] }}</BaseBadge>
      </div>
    </BaseCard>

    <BaseCard as="section" aria-labelledby="pr-vocab">
      <template #head>
        <h2 id="pr-vocab" class="type-body font-semibold">Kelime ustalığı</h2>
        <ProgressBar v-if="data.mastery.length" class="mt-2" :value="mastered" :max="data.mastery.length" label="Öğrenilen kelimeler" />
      </template>
      <EmptyState v-if="!vocabRows.length" title="Henüz kelime çalışması yok" />
      <BaseTable
        v-else
        caption="Kelimeler, en çok hata yapılandan başlayarak"
        row-key="id"
        :rows="vocabRows"
        :columns="[
          { key: 'item', label: 'Kelime' },
          { key: 'correct', label: 'Son hatadan beri doğru', align: 'end' },
          { key: 'incorrect', label: 'Hata', align: 'end' },
          { key: 'state', label: 'Durum' },
        ]"
      />
    </BaseCard>

    <BaseCard as="section" aria-labelledby="pr-assess">
      <template #head><h2 id="pr-assess" class="type-body font-semibold">Değerlendirme sonuçları</h2></template>
      <EmptyState v-if="!assessmentRows.length" title="Henüz değerlendirme yok" />
      <BaseTable
        v-else
        caption="Değerlendirme sonuçları"
        caption-hidden
        row-key="id"
        :rows="assessmentRows"
        :columns="[
          { key: 'lesson', label: 'Ders' },
          { key: 'quiz', label: 'Test', align: 'end' },
          { key: 'reading', label: 'Okuma', align: 'end' },
          { key: 'percent', label: 'Puan', align: 'end' },
          { key: 'at', label: 'Tarih', nowrap: true },
        ]"
      />
    </BaseCard>

    <BaseCard as="section" aria-labelledby="pr-attempts">
      <template #head><h2 id="pr-attempts" class="type-body font-semibold">Son yanıtlar</h2></template>
      <EmptyState v-if="!attemptRows.length" title="Henüz yanıt yok" />
      <BaseTable
        v-else
        caption="Son 25 yanıt"
        caption-hidden
        row-key="id"
        :rows="attemptRows"
        :columns="[
          { key: 'question', label: 'Soru' },
          { key: 'section', label: 'Bölüm' },
          { key: 'result', label: 'Sonuç' },
          { key: 'detail', label: 'Ayrıntı' },
          { key: 'at', label: 'Zaman', nowrap: true },
        ]"
      />
    </BaseCard>
  </div>
</template>
