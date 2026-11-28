<script setup lang="ts">
/*
 * The 60-minute speaking plan and teacher guide of one lesson (its published revision, else the latest),
 * read-only. Shown where the teacher works with a student: the program card and the lesson test page.
 * Editing stays on the lesson page ("Konuşma planı" tab).
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseDisclosure } from 'rei-kit/web'
import { SpeakingPlan, TeacherGuide } from '@/domain/content'
import { adminMaterial, listPackages } from '@/lib/api/admin'
import SpeakingPlanBlocks from '../coaching/SpeakingPlanBlocks.vue'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'
import TeacherGuideView from './TeacherGuideView.vue'

const { lessonId, packageId = null } = defineProps<{ lessonId: string; packageId?: string | null }>()

const state = useLoad(
  async () => {
    let id = packageId
    if (!id) {
      const ps = await listPackages(lessonId)
      id = (ps.find((p) => p.status === 'published') ?? ps.find((p) => p.status !== 'archived'))?.id ?? null
    }
    return id ? adminMaterial(id) : null
  },
  () => [lessonId, packageId],
)
const plan = computed(() => {
  const r = SpeakingPlan.safeParse(state.data.value?.speaking_plan as unknown)
  return r.success ? r.data : null
})
const guide = computed(() => {
  const r = TeacherGuide.safeParse(state.data.value?.teacher_guide as unknown)
  return r.success ? r.data : null
})
</script>

<template>
  <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
    <div class="flex flex-col gap-3">
      <SpeakingPlanBlocks v-if="plan" :plan="plan" />
      <p v-else class="text-ink-soft type-small">
        Bu dersin konuşma planı yok.
        <RouterLink class="focus-ring rounded-cell underline" :to="{ name: 'admin-lesson', params: { lessonId }, query: { sekme: 'speaking' } }">Ders sayfasında oluştur</RouterLink>
      </p>
      <BaseDisclosure v-if="guide" title="Öğretmen rehberi (zorluklar, sık hatalar, dinleme metni)" :heading-level="3">
        <TeacherGuideView :guide="guide" compact />
      </BaseDisclosure>
    </div>
  </LoadState>
</template>
