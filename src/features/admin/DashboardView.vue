<script setup lang="ts">
import { computed } from 'vue'
import { listSpeakingSessions, listStudents, recentActivity } from '@/lib/api/admin'
import LoadState from './components/LoadState.vue'
import DashboardAttention from './components/DashboardAttention.vue'
import DashboardDeclines from './components/DashboardDeclines.vue'
import DashboardFeeds from './components/DashboardFeeds.vue'
import { attentionReasons } from './lib/insights'
import { useLoad } from './lib/use-load'
import PageHeader from './components/AdminPageHeader.vue'

const DAY = 86_400_000

/* Counters and attention first; the feeds load their own extras after this resolves. */
const since = new Date(Date.now() - 30 * DAY).toISOString()
const { data, loading, error, reload } = useLoad(async () => {
  const [students, activity, speaking] = await Promise.all([
    listStudents(),
    recentActivity(since),
    listSpeakingSessions({ from: new Date(Date.now() - DAY).toISOString() }),
  ])
  return { students, activity, speaking }
})

const stats = computed(() => {
  const d = data.value
  if (!d) return []
  const weekAgo = Date.now() - 7 * DAY
  return [
    { label: 'Aktif öğrenci', value: d.students.filter((x) => x.status === 'active').length },
    { label: 'Bu hafta ders', value: d.activity.completions.filter((c) => Date.parse(c.completed_at) > weekAgo).length },
    { label: 'Planlı oturum', value: d.speaking.filter((s) => s.status === 'planned').length },
  ]
})

const attention = computed(() => {
  const d = data.value
  if (!d) return []
  return d.students
    .filter((s) => s.status === 'active')
    .map((s) => {
      const reasons = attentionReasons({
        hasProgram: s.program?.status === 'active',
        lastActivityAt: s.lastActivityAt,
        sessions: d.activity.sessions.filter((x) => x.student_id === s.id),
        assessments: d.activity.assessments.filter((a) => a.student_id === s.id).map((a) => ({ submittedAt: a.submitted_at, percent: a.percent })),
        attempts: d.activity.attempts.filter((a) => a.student_id === s.id).map((a) => ({ attemptNo: a.attempt_no, correct: a.correct, at: a.created_at })),
      })
      return { student: s, reasons }
    })
    .filter((x) => x.reasons.length)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Bugün" as="h1" />
    <LoadState :loading="loading" :error="error" :rows="6" @retry="reload">
      <template v-if="data">
        <section aria-labelledby="dash-stats">
          <h2 id="dash-stats" class="sr-only">Özet</h2>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="s in stats" :key="s.label" class="border-hair bg-surface rounded-tile border p-4">
              <p class="type-small text-ink-soft">{{ s.label }}</p>
              <p class="mt-1 text-2xl font-semibold" :class="s.value === 0 ? 'text-ink-soft' : 'text-ink'">{{ s.value }}</p>
            </div>
          </div>
        </section>
        <DashboardAttention :items="attention" />
        <DashboardDeclines :students="data.students" />
        <DashboardFeeds :students="data.students" :activity="data.activity" :speaking="data.speaking" />
      </template>
    </LoadState>
  </div>
</template>
