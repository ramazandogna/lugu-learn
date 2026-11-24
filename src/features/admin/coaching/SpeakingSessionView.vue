<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { BaseCard, EmptyState, PageHeader } from 'rei-kit'
import { TeacherGuide } from '@/domain/content'
import { getSpeakingSession, getStudent, latestJob, lessonTeacherMaterial } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import TeacherGuideView from '../content/TeacherGuideView.vue'
import { formatDateTime } from '../lib/format'
import { useLoad } from '../lib/use-load'
import SpeakingNotesForm from './SpeakingNotesForm.vue'
import SpeakingPlanCard from './SpeakingPlanCard.vue'
import SpeakingTimer from './SpeakingTimer.vue'

const route = useRoute()
const sessionId = computed(() => String(route.params.sessionId))

const state = useLoad(async () => {
  const { session, note } = await getSpeakingSession(sessionId.value)
  const [student, material, job] = await Promise.all([
    getStudent(session.student_id),
    session.lesson_id ? lessonTeacherMaterial(session.lesson_id) : null,
    latestJob({ kind: 'speaking_plan', studentId: session.student_id }),
  ])
  return { session, note, student, material, job: job && (job.input as { speakingSessionId?: string } | null)?.speakingSessionId === session.id ? job : null }
}, sessionId)

const guide = computed(() => {
  const r = TeacherGuide.safeParse(state.data.value?.material?.teacher_guide as unknown)
  return r.success ? r.data : null
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <RouterLink :to="{ name: 'admin-speaking' }" class="focus-ring rounded-cell text-ink-soft w-fit type-small hover:underline">‹ Konuşma & Koçluk</RouterLink>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <template v-if="state.data.value">
        <PageHeader :title="`Konuşma oturumu · ${state.data.value.student?.name ?? 'Öğrenci'}`" as="h1" />
        <p class="text-ink-soft -mt-4 type-small">
          Planlanan: {{ formatDateTime(state.data.value.session.planned_at) }}
          <template v-if="state.data.value.student">
            ·
            <RouterLink :to="{ name: 'admin-student', params: { studentId: state.data.value.student.id } }" class="focus-ring rounded-cell hover:underline">
              öğrenci profili
            </RouterLink>
          </template>
        </p>
        <div class="grid gap-4 xl:grid-cols-[3fr_2fr]">
          <div class="flex flex-col gap-4">
            <SpeakingTimer :session="state.data.value.session" @changed="state.reload" />
            <SpeakingPlanCard :session="state.data.value.session" :job="state.data.value.job" @changed="state.reload" />
            <SpeakingNotesForm :session-id="state.data.value.session.id" :note="state.data.value.note" @saved="state.reload" />
          </div>
          <BaseCard as="aside" aria-labelledby="sp-guide" class="h-fit">
            <template #head>
              <h2 id="sp-guide" class="type-body font-semibold">Öğretmen rehberi</h2>
              <p class="text-ink-soft type-small">Öğrencinin şu anki dersinin rehberi (yalnızca yönetici görür).</p>
            </template>
            <EmptyState v-if="!guide" title="Bu ders için öğretmen rehberi yok" />
            <TeacherGuideView v-else :guide="guide" compact />
          </BaseCard>
        </div>
      </template>
    </LoadState>
  </div>
</template>
