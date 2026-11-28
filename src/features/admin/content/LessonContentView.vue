<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Play } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseSelect } from 'rei-kit'
import type { TabPanel } from 'rei-kit/web'
import { adminMaterial, latestJob, lessonContext, listPackages, type PackageRow } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { PACKAGE_STATUS, PACKAGE_TONE, formatDateTime } from '../lib/format'
import { useLoad } from '../lib/use-load'
import AdminMaterialPanel from './AdminMaterialPanel.vue'
import GeneratePanel from './GeneratePanel.vue'
import PackageEditor from './PackageEditor.vue'
import PackageStatusBar from './PackageStatusBar.vue'
import QaReportView from './QaReportView.vue'
import EmptyState from '../components/AdminEmpty.vue'
import PageHeader from '../components/AdminPageHeader.vue'
import BaseTabs from '../components/ScrollTabs.vue'

const route = useRoute()
const lessonId = computed(() => String(route.params.lessonId))

const state = useLoad(async () => {
  const [ctx, packages, job] = await Promise.all([lessonContext(lessonId.value), listPackages(lessonId.value), latestJob({ kind: 'lesson_package', lessonId: lessonId.value })])
  return { ...ctx, packages, job }
}, lessonId)

const selectedId = ref<string | undefined>()
const startBlank = ref(false)
watch(
  () => state.data.value?.packages,
  (ps) => {
    if (ps && !ps.some((p) => p.id === selectedId.value)) selectedId.value = (ps.find((p) => p.status !== 'archived') ?? ps[0])?.id
  },
)
const selected = computed(() => state.data.value?.packages.find((p) => p.id === selectedId.value) ?? null)
const material = useLoad(async () => (selectedId.value ? adminMaterial(selectedId.value) : null), selectedId)

const revisionOptions = computed(() =>
  (state.data.value?.packages ?? []).map((p) => ({
    value: p.id,
    label: `Revizyon ${p.revision} · ${PACKAGE_STATUS[p.status]} · ${p.origin === 'ai' ? 'AI' : 'elle'} · ${formatDateTime(p.updated_at)}`,
  })),
)

type Tab = 'editor' | 'qa' | 'guide' | 'speaking'
const tabs: TabPanel<Tab>[] = [
  { key: 'editor', label: 'İçerik düzenleyici' },
  { key: 'qa', label: 'Kalite raporu' },
  { key: 'guide', label: 'Öğretmen rehberi' },
  { key: 'speaking', label: 'Konuşma planı' },
]
const TAB_KEYS: readonly Tab[] = ['editor', 'qa', 'guide', 'speaking']
/* `?sekme=speaking` opens a tab directly (links from the student's program card). */
const tab = ref<Tab>(TAB_KEYS.find((k) => k === route.query.sekme) ?? 'editor')

async function onSaved(row: PackageRow) {
  startBlank.value = false
  await state.reload()
  selectedId.value = row.id
}
async function onGenerated(packageId: string | null) {
  await state.reload()
  if (packageId) selectedId.value = packageId
}
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
              <Play :size="18" aria-hidden="true" /> Dersi test et
            </BaseButton>
          </template>
        </PageHeader>

        <GeneratePanel :lesson-id="lessonId" :job="state.data.value.job" @finished="onGenerated" />

        <EmptyState
          v-if="!state.data.value.packages.length && !startBlank"
          title="Bu dersin henüz içeriği yok"
          description="AI ile bir taslak oluşturun ya da boş bir taslakla elle başlayın."
        >
          <template #action><BaseButton variant="secondary" @click="startBlank = true">Boş taslakla başla</BaseButton></template>
        </EmptyState>

        <PackageEditor
          v-else-if="startBlank && !selected"
          :pkg="null"
          :lesson-id="lessonId"
          :lesson-title="state.data.value.lesson.title"
          :minutes="state.data.value.lesson.estimated_minutes"
          @saved="onSaved"
        />

        <template v-else-if="selected">
          <section class="flex flex-wrap items-end gap-3" aria-label="Revizyon">
            <BaseSelect v-model="selectedId" class="min-w-80" label="Revizyon" :options="revisionOptions" />
            <BaseBadge :tone="PACKAGE_TONE[selected.status]">{{ PACKAGE_STATUS[selected.status] }}</BaseBadge>
          </section>
          <PackageStatusBar :pkg="selected" @changed="state.reload" />
          <BaseTabs v-model="tab" :items="tabs" label="Ders içeriği">
            <template #default="{ active }">
              <div class="pt-4">
                <PackageEditor
                  v-if="active === 'editor'"
                  :pkg="selected"
                  :lesson-id="lessonId"
                  :lesson-title="state.data.value.lesson.title"
                  :minutes="state.data.value.lesson.estimated_minutes"
                  @saved="onSaved"
                />
                <LoadState v-else :loading="material.loading.value" :error="material.error.value" @retry="material.reload">
                  <QaReportView v-if="active === 'qa'" :report="material.data.value?.qa_report ?? null" />
                  <AdminMaterialPanel
                    v-else
                    :package-id="selected.id"
                    :material="material.data.value ?? null"
                    :part="active === 'guide' ? 'guide' : 'speaking'"
                    @saved="material.reload"
                  />
                </LoadState>
              </div>
            </template>
          </BaseTabs>
        </template>
      </template>
    </LoadState>
  </div>
</template>
