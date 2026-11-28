<script setup lang="ts">
/*
 * One speaking session, laid out for use during the lesson: timer and lesson picker on top, the lesson's
 * authored 60-minute plan and guide next to the session record (targets, what we talked about, notes).
 */
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { BaseCard, BaseSelect } from 'rei-kit'
import { TeacherGuide } from '@/domain/content'
import { getSpeakingSession, getStudent, lessonTeacherMaterial, updateSpeakingSession } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import LessonSpeakingPanel from '../content/LessonSpeakingPanel.vue'
import { formatDateTime } from '../lib/format'
import { useAction, useLoad } from '../lib/use-load'
import { speakingLessonOptions } from './lesson-options'
import SpeakingNotesForm from './SpeakingNotesForm.vue'
import SpeakingTimer from './SpeakingTimer.vue'
import PageHeader from '../components/AdminPageHeader.vue'

const route = useRoute()
const sessionId = computed(() => String(route.params.sessionId))

const state = useLoad(async () => {
  const { session, note } = await getSpeakingSession(sessionId.value)
  const [student, material, lessons] = await Promise.all([
    getStudent(session.student_id),
    session.lesson_id ? lessonTeacherMaterial(session.lesson_id) : null,
    speakingLessonOptions(session.student_id),
  ])
  return { session, note, student, material, lessons }
}, sessionId)

/** Suggested targets for the session record: the lesson's objective and speaking prompts. */
const suggestions = computed(() => {
  const r = TeacherGuide.safeParse(state.data.value?.material?.teacher_guide as unknown)
  return r.success ? [r.data.objective, ...r.data.speakingPrompts.slice(0, 4)] : []
})

const lessonId = ref<string | undefined>()
watch(() => state.data.value?.session.lesson_id, (v) => (lessonId.value = v ?? undefined), { immediate: true })
const { busy, run } = useAction()
async function changeLesson(v: string | undefined) {
  if (!v || !state.data.value || v === state.data.value.session.lesson_id) return
  const ok = await run(() => updateSpeakingSession(state.data.value!.session.id, { lesson_id: v }), 'Oturumun dersi değişti')
  if (ok) await state.reload()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <RouterLink :to="{ name: 'admin-speaking' }" class="focus-ring rounded-cell text-ink-soft -my-2 inline-flex min-h-10 w-fit items-center type-small hover:underline">‹ Oturumlar</RouterLink>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <template v-if="state.data.value">
        <PageHeader :title="`Konuşma oturumu · ${state.data.value.student?.name ?? 'Öğrenci'}`" as="h1" />
        <p class="text-ink-soft -mt-4 type-small">
          Planlanan: {{ formatDateTime(state.data.value.session.planned_at) }}
          <template v-if="state.data.value.student">
            ·
            <RouterLink :to="{ name: 'admin-student', params: { studentId: state.data.value.student.id }, query: { sekme: 'ilerleme' } }" class="focus-ring rounded-cell hover:underline">
              öğrencinin ilerlemesi
            </RouterLink>
          </template>
        </p>
        <div class="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div class="flex min-w-0 flex-col gap-4">
            <SpeakingTimer :session="state.data.value.session" @changed="state.reload" />
            <BaseCard as="section" aria-labelledby="sp-lesson">
              <template #head>
                <h2 id="sp-lesson" class="type-body font-semibold">Bu oturumda hangi dersi konuşuyoruz?</h2>
                <p class="text-ink-soft type-small">Planı ve önerilen hedefleri bu dersten alır.</p>
              </template>
              <BaseSelect
                :model-value="lessonId"
                label="Ders"
                placeholder="Ders seçin"
                :options="state.data.value.lessons.options"
                :disabled="busy || !state.data.value.lessons.options.length"
                @update:model-value="(v: string | undefined) => changeLesson(v)"
              />
            </BaseCard>
            <SpeakingNotesForm :session-id="state.data.value.session.id" :note="state.data.value.note" :suggestions="suggestions" @saved="state.reload" />
          </div>
          <div class="flex min-w-0 flex-col gap-4">
            <BaseCard as="section" aria-labelledby="sp-plan" class="lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
              <template #head>
                <h2 id="sp-plan" class="type-body font-semibold">Dersin 1 saatlik konuşma planı</h2>
                <p class="text-ink-soft type-small">Konuşma akışı, dinleme metni ve öğretmen rehberi (yalnızca siz görürsünüz).</p>
              </template>
              <LessonSpeakingPanel v-if="state.data.value.session.lesson_id" :lesson-id="state.data.value.session.lesson_id" />
              <p v-else class="text-ink-soft type-small">Önce soldan bir ders seçin.</p>
            </BaseCard>
          </div>
        </div>
      </template>
    </LoadState>
  </div>
</template>
