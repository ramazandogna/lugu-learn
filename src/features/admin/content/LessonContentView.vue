<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Play } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseSelect } from 'rei-kit'
import type { TabPanel } from 'rei-kit/web'
import { SpeakingPlan, TeacherGuide } from '@/domain/content'
import { adminMaterial, lessonContext, listPackages } from '@/lib/api/admin'
import SpeakingPlanBlocks from '../coaching/SpeakingPlanBlocks.vue'
import EmptyState from '../components/AdminEmpty.vue'
import LoadState from '../components/LoadState.vue'
import PageHeader from '../components/AdminPageHeader.vue'
import BaseTabs from '../components/ScrollTabs.vue'
import { PACKAGE_STATUS, PACKAGE_TONE, formatDateTime } from '../lib/format'
import { useLoad } from '../lib/use-load'
import TeacherGuideView from './TeacherGuideView.vue'

const route = useRoute()
const lessonId = computed(() => String(route.params.lessonId))

const state = useLoad(async () => {
  const [ctx, packages] = await Promise.all([lessonContext(lessonId.value), listPackages(lessonId.value)])
  return { ...ctx, packages }
}, lessonId)

const selectedId = ref<string | undefined>()
watch(
  () => state.data.value?.packages,
  (ps) => {
    if (ps && !ps.some((p) => p.id === selectedId.value)) selectedId.value = (ps.find((p) => p.status === 'published') ?? ps.find((p) => p.status !== 'archived') ?? ps[0])?.id
  },
  { immediate: true },
)
const selected = computed(() => state.data.value?.packages.find((p) => p.id === selectedId.value) ?? null)
const material = useLoad(async () => (selectedId.value ? adminMaterial(selectedId.value) : null), selectedId)

const revisionOptions = computed(() =>
  (state.data.value?.packages ?? []).map((p) => ({ value: p.id, label: `Revizyon ${p.revision} · ${PACKAGE_STATUS[p.status]} · ${formatDateTime(p.updated_at)}` })),
)

const guide = computed(() => {
  const r = TeacherGuide.safeParse(material.data.value?.teacher_guide as unknown)
  return r.success ? r.data : null
})
const plan = computed(() => {
  const r = SpeakingPlan.safeParse(material.data.value?.speaking_plan as unknown)
  return r.success ? r.data : null
})

type Tab = 'guide' | 'speaking' | 'status'
const tabs: TabPanel<Tab>[] = [
  { key: 'guide', label: 'Öğretmen kılavuzu' },
  { key: 'speaking', label: 'Konuşma planı' },
  { key: 'status', label: 'Yayın durumu' },
]
const TAB_KEYS: readonly Tab[] = ['guide', 'speaking', 'status']
/* `?sekme=speaking` opens a tab directly (links from the student's program card). */
const tab = ref<Tab>(TAB_KEYS.find((k) => k === route.query.sekme) ?? 'guide')
</script>

<template>
  <div class="flex flex-col gap-6">
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <template v-if="state.data.value">
        <RouterLink
          :to="{ name: 'admin-curriculum', params: { curriculumId: state.data.value.curriculum.id } }"
          class="focus-ring rounded-cell text-ink-soft w-fit type-small hover:underline"
        >
          ‹ {{ state.data.value.curriculum.name }} · sürüm {{ state.data.value.version.version }}
        </RouterLink>
        <PageHeader :title="`${state.data.value.lesson.sequence}. ${state.data.value.lesson.title}`" as="h1">
          <template #right>
            <BaseButton v-if="state.data.value.packages.length" as="router-link" :to="{ name: 'admin-lesson-preview', params: { lessonId }, query: selectedId ? { paket: selectedId } : {} }">
              <Play :size="18" aria-hidden="true" /> Dersi dene
            </BaseButton>
          </template>
        </PageHeader>

        <EmptyState v-if="!state.data.value.packages.length" title="Bu dersin henüz içeriği yok" />
        <template v-else-if="selected">
          <section class="flex flex-wrap items-end gap-3" aria-label="Revizyon">
            <BaseSelect v-model="selectedId" class="min-w-80" label="Revizyon" :options="revisionOptions" />
            <BaseBadge :tone="PACKAGE_TONE[selected.status]">{{ PACKAGE_STATUS[selected.status] }}</BaseBadge>
          </section>
          <BaseTabs v-model="tab" :items="tabs" label="Ders içeriği">
            <template #default="{ active }">
              <div class="pt-4">
                <LoadState v-if="active !== 'status'" :loading="material.loading.value" :error="material.error.value" @retry="material.reload">
                  <template v-if="active === 'guide'">
                    <TeacherGuideView v-if="guide" :guide="guide" />
                    <EmptyState v-else title="Öğretmen kılavuzu yok" />
                  </template>
                  <template v-else>
                    <SpeakingPlanBlocks v-if="plan" :plan="plan" />
                    <EmptyState v-else title="Konuşma planı yok" />
                  </template>
                </LoadState>
                <ul v-else class="flex flex-col gap-2" aria-label="Revizyonlar">
                  <li v-for="p in state.data.value.packages" :key="p.id" class="surface rounded-card flex flex-wrap items-center gap-3 p-3">
                    <span class="font-semibold">Revizyon {{ p.revision }}</span>
                    <BaseBadge :tone="PACKAGE_TONE[p.status]">{{ PACKAGE_STATUS[p.status] }}</BaseBadge>
                    <span class="text-ink-soft type-small">{{ formatDateTime(p.updated_at) }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </BaseTabs>
        </template>
      </template>
    </LoadState>
  </div>
</template>
