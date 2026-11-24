<script setup lang="ts">
import { computed } from 'vue'
import { StatCard } from 'rei-kit'
import { listSpeakingSessions, listStudents, recentActivity, recentExams } from '@/lib/api/admin'
import LoadState from './components/LoadState.vue'
import DashboardAttention from './components/DashboardAttention.vue'
import DashboardDeclines from './components/DashboardDeclines.vue'
import DashboardFeeds from './components/DashboardFeeds.vue'
import { attentionReasons } from './lib/attention'
import { useLoad } from './lib/use-load'
import PageHeader from './components/AdminPageHeader.vue'

const DAY = 86_400_000

const since = new Date(Date.now() - 30 * DAY).toISOString()
const { data, loading, error, reload } = useLoad(async () => {
  const [students, activity, speaking, exams] = await Promise.all([
    listStudents(),
    recentActivity(since),
    listSpeakingSessions({ from: new Date(Date.now() - DAY).toISOString() }),
    recentExams(12),
  ])
  return { students, activity, speaking, exams }
})

const stats = computed(() => {
  const d = data.value
  if (!d) return []
  const s = d.students
  const completed = d.activity.completions.length
  const abandoned = d.activity.sessions.filter((x) => x.status === 'abandoned').length
  const open = d.activity.sessions.filter((x) => x.status === 'active').length
  return [
    { label: 'Toplam öğrenci', value: String(s.length) },
    { label: 'Etkin', value: String(s.filter((x) => x.status === 'active').length) },
    { label: 'Duraklatılmış', value: String(s.filter((x) => x.status === 'paused').length) },
    { label: 'Biten ders · 30 gün', value: String(completed) },
    { label: 'Yarım oturum · 30 gün', value: String(abandoned) },
    { label: 'Açık oturum', value: String(open) },
  ]
})

const attention = computed(() => {
  const d = data.value
  if (!d) return []
  return d.students
    .map((s) => {
      const attempts = d.activity.attempts
        .filter((a) => a.student_id === s.id)
        .map((a) => ({
          questionId: a.question_id,
          section: a.section,
          attemptNo: a.attempt_no,
          correct: a.correct,
          responseMs: a.response_ms,
          hintUsed: a.hint_used,
          at: a.created_at,
        }))
      const latest = d.activity.assessments.find((a) => a.student_id === s.id)
      const reasons = attentionReasons({
        status: s.status,
        hasActiveProgram: s.program?.status === 'active',
        lastActivityAt: s.lastActivityAt,
        sessions: d.activity.sessions.filter((x) => x.student_id === s.id).map((x) => ({ status: x.status, startedAt: x.started_at, kind: x.kind })),
        attempts,
        vocab: d.activity.mastery
          .filter((m) => m.student_id === s.id)
          .map((m) => ({ itemId: m.item_id, correctCount: m.correct_count, incorrectCount: m.incorrect_count, masteredAt: m.mastered_at })),
        latestAssessmentPercent: latest ? latest.percent : null,
      })
      return { student: s, reasons }
    })
    .filter((x) => x.reasons.length)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Panel" as="h1" />
    <LoadState :loading="loading" :error="error" :rows="6" @retry="reload">
      <template v-if="data">
        <section aria-labelledby="dash-stats">
          <h2 id="dash-stats" class="sr-only">Özet</h2>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 [&>*]:h-full">
            <StatCard v-for="s in stats" :key="s.label" :label="s.label" :value="s.value" />
          </div>
        </section>
        <DashboardAttention :items="attention" />
        <DashboardDeclines :students="data.students" />
        <DashboardFeeds
          :students="data.students"
          :activity="data.activity"
          :speaking="data.speaking"
          :exams="data.exams"
        />
      </template>
    </LoadState>
  </div>
</template>
