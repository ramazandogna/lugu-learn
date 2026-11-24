<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseCard, EmptyState } from 'rei-kit'
import type { Exam, ExamResult, RecentActivity, SpeakingSession, StudentSummary } from '@/lib/api/admin'
import { SESSION_STATUS, formatDate, formatDateTime, formatNumber } from '../lib/format'

const props = defineProps<{
  students: readonly StudentSummary[]
  activity: RecentActivity
  speaking: readonly SpeakingSession[]
  exams: { exams: Exam[]; results: ExamResult[] }
}>()

const name = (id: string) => props.students.find((s) => s.id === id)?.name ?? 'Öğrenci'
const lesson = (id: string | null) => (id ? (props.activity.lessons.get(id)?.title ?? 'Ders') : '—')

const recent = computed(() =>
  props.activity.sessions.slice(0, 10).map((s) => ({
    key: s.id,
    studentId: s.student_id,
    text: `${lesson(s.lesson_id)} · ${s.kind === 'replay' ? 'tekrar' : 'ders'} · ${SESSION_STATUS[s.status]}`,
    at: s.last_seen_at,
  })),
)

const upcoming = computed(() =>
  props.speaking
    .filter((s) => s.status === 'planned' || s.status === 'started')
    .sort((a, b) => (a.planned_at ?? '').localeCompare(b.planned_at ?? ''))
    .slice(0, 8),
)

const sessionLesson = computed(() => new Map(props.activity.sessions.map((s) => [s.id, s.lesson_id])))

const academic = computed(() =>
  props.exams.exams.map((e) => {
    const rs = props.exams.results.filter((r) => r.exam_id === e.id)
    return { exam: e, net: rs.reduce((sum, r) => sum + r.net, 0), subjects: rs.length }
  }),
)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <BaseCard as="section" aria-labelledby="dash-recent">
      <template #head><h2 id="dash-recent" class="type-body font-semibold">Son etkinlikler</h2></template>
      <EmptyState v-if="!recent.length" title="Son 30 günde oturum yok" />
      <ul v-else class="divide-hair divide-y type-small">
        <li v-for="r in recent" :key="r.key" class="flex flex-wrap items-baseline justify-between gap-2 py-2">
          <span>
            <RouterLink :to="{ name: 'admin-student', params: { studentId: r.studentId } }" class="focus-ring rounded-cell font-semibold hover:underline">
              {{ name(r.studentId) }}
            </RouterLink>
            <span class="text-ink-soft"> · {{ r.text }}</span>
          </span>
          <span class="text-ink-soft type-small">{{ formatDateTime(r.at) }}</span>
        </li>
      </ul>
    </BaseCard>

    <BaseCard as="section" aria-labelledby="dash-speaking">
      <template #head><h2 id="dash-speaking" class="type-body font-semibold">Yaklaşan konuşma oturumları</h2></template>
      <EmptyState v-if="!upcoming.length" title="Planlanmış konuşma oturumu yok" />
      <ul v-else class="divide-hair divide-y type-small">
        <li v-for="s in upcoming" :key="s.id" class="flex items-baseline justify-between gap-2 py-2">
          <RouterLink :to="{ name: 'admin-speaking-session', params: { sessionId: s.id } }" class="focus-ring rounded-cell font-semibold hover:underline">
            {{ name(s.student_id) }}
          </RouterLink>
          <span class="text-ink-soft type-small">{{ formatDateTime(s.planned_at) }}</span>
        </li>
      </ul>
    </BaseCard>

    <BaseCard as="section" aria-labelledby="dash-assess">
      <template #head><h2 id="dash-assess" class="type-body font-semibold">Son değerlendirmeler</h2></template>
      <EmptyState v-if="!activity.assessments.length" title="Son 30 günde değerlendirme yok" />
      <ul v-else class="divide-hair divide-y type-small">
        <li v-for="a in activity.assessments.slice(0, 8)" :key="a.id" class="flex items-baseline justify-between gap-2 py-2">
          <span>
            <RouterLink :to="{ name: 'admin-student', params: { studentId: a.student_id } }" class="focus-ring rounded-cell font-semibold hover:underline">
              {{ name(a.student_id) }}
            </RouterLink>
            <span class="text-ink-soft"> · {{ lesson(sessionLesson.get(a.session_id) ?? null) }}</span>
          </span>
          <span class="font-semibold">%{{ Math.round(a.percent) }}</span>
        </li>
      </ul>
    </BaseCard>

    <BaseCard as="section" aria-labelledby="dash-academic">
      <template #head><h2 id="dash-academic" class="type-body font-semibold">Akademik özet</h2></template>
      <EmptyState v-if="!academic.length" title="Kayıtlı okul sınavı yok" />
      <ul v-else class="divide-hair divide-y type-small">
        <li v-for="x in academic" :key="x.exam.id" class="flex flex-wrap items-baseline justify-between gap-2 py-2">
          <span>
            <RouterLink :to="{ name: 'admin-student', params: { studentId: x.exam.student_id }, query: { sekme: 'akademik' } }" class="focus-ring rounded-cell font-semibold hover:underline">
              {{ name(x.exam.student_id) }}
            </RouterLink>
            <span class="text-ink-soft"> · {{ x.exam.title }} · {{ formatDate(x.exam.exam_date) }}</span>
          </span>
          <span class="text-ink-soft">{{ x.subjects }} ders · toplam net <strong class="text-ink">{{ formatNumber(x.net) }}</strong></span>
        </li>
      </ul>
    </BaseCard>
  </div>
</template>
