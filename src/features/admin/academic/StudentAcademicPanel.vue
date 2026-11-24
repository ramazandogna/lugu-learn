<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { BarChart, BaseBadge, BaseButton, BaseCard } from 'rei-kit'
import { subjectTrends } from '@/domain/analytics'
import { listSubjects, studentExams, wrongPenalty, type Exam } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { formatNumber } from '../lib/format'
import { useLoad } from '../lib/use-load'
import AcademicInsightCard from './AcademicInsightCard.vue'
import ExamDialog from './ExamDialog.vue'
import ExamList from './ExamList.vue'
import EmptyState from '../components/AdminEmpty.vue'

const { studentId } = defineProps<{ studentId: string }>()

const state = useLoad(async () => {
  const [subjects, exams, penalty] = await Promise.all([listSubjects(), studentExams(studentId), wrongPenalty()])
  return { subjects, ...exams, penalty }
})

const editing = ref<Exam | null>(null)
const dialog = ref(false)
function openExam(e: Exam | null) {
  editing.value = e
  dialog.value = true
}

const subjectName = (id: string) => state.data.value?.subjects.find((s) => s.id === id)?.name ?? 'Ders'
const trends = computed(() => {
  const d = state.data.value
  if (!d) return []
  const date = new Map(d.exams.map((e) => [e.id, e.exam_date]))
  const points = d.results.map((r) => ({ subjectId: r.subject_id, date: date.get(r.exam_id) ?? '', net: r.net }))
  return [...subjectTrends(points, subjectName)].map(([id, t]) => ({ id, name: subjectName(id), trend: t }))
})
const comparison = computed(() =>
  trends.value.filter((t) => t.trend.latest !== null).map((t) => ({ key: t.id, label: t.name, value: Math.max(0, t.trend.latest ?? 0) })),
)
const TREND: Record<string, { label: string; tone: 'success' | 'danger' | 'neutral' }> = {
  improvement: { label: 'Artış', tone: 'success' },
  decline: { label: 'Düşüş', tone: 'danger' },
  stable: { label: 'Durağan', tone: 'neutral' },
  insufficient_data: { label: 'Yetersiz veri', tone: 'neutral' },
}
</script>

<template>
  <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
    <div v-if="state.data.value" class="flex flex-col gap-4">
      <BaseCard as="section" aria-labelledby="ac-exams">
        <template #head>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 id="ac-exams" class="type-body font-semibold">Okul sınavları</h2>
            <BaseButton size="sm" :disabled="!state.data.value.subjects.length" @click="openExam(null)">
              <Plus class="size-4" aria-hidden="true" /> Sınav ekle
            </BaseButton>
          </div>
          <p class="text-ink-soft type-small">Net = doğru − yanlış × {{ formatNumber(state.data.value.penalty) }} (veritabanı hesaplar; ceza Ayarlar'dan değişir).</p>
        </template>
        <EmptyState v-if="!state.data.value.subjects.length" title="Önce ders tanımlayın" description="Akademik Takip sayfasındaki Dersler bölümünden okul derslerini ekleyin." />
        <ExamList v-else :exams="state.data.value.exams" :results="state.data.value.results" :subject-name="subjectName" @edit="openExam" @changed="state.reload" />
      </BaseCard>

      <BaseCard v-if="trends.length" as="section" aria-labelledby="ac-trends">
        <template #head><h2 id="ac-trends" class="type-body font-semibold">Derslere göre eğilim</h2></template>
        <ul class="divide-hair divide-y">
          <li v-for="t in trends" :key="t.id" class="flex flex-wrap items-center justify-between gap-2 py-2 type-small">
            <span>{{ t.trend.text }}</span>
            <BaseBadge :tone="TREND[t.trend.label]?.tone">{{ TREND[t.trend.label]?.label }}</BaseBadge>
          </li>
        </ul>
        <div v-if="comparison.length > 1" class="mt-4">
          <h3 class="mb-2 type-small font-semibold">Son sınav netleri, derslere göre</h3>
          <BarChart :series="comparison" label="Son sınav netleri" :value-label="(v: number) => `${formatNumber(v)} net`" />
        </div>
      </BaseCard>

      <AcademicInsightCard :student-id="studentId" :has-exams="state.data.value.exams.length > 0" />

      <ExamDialog
        v-model="dialog"
        :student-id="studentId"
        :exam="editing"
        :results="editing ? state.data.value.results.filter((r) => r.exam_id === editing?.id) : []"
        :subjects="state.data.value.subjects"
        :penalty="state.data.value.penalty"
        @saved="state.reload"
      />
    </div>
  </LoadState>
</template>
