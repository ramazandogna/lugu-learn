<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { BaseBadge, BaseButton, BasePopconfirm, BaseSelect } from 'rei-kit'
import type { TabPanel } from 'rei-kit/web'
import { deleteCurriculum, getCurriculum, newVersion, publishVersion, versionContents } from '@/lib/api/admin'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import LoadState from '../components/LoadState.vue'
import { formatDate } from '../lib/format'
import { useAction, useLoad } from '../lib/use-load'
import AssignToStudentsDialog from './AssignToStudentsDialog.vue'
import CurriculumDialog from './CurriculumDialog.vue'
import LessonList from './LessonList.vue'
import ObjectivesEditor from './ObjectivesEditor.vue'
import SourcesPanel from './SourcesPanel.vue'
import PageHeader from '../components/AdminPageHeader.vue'
import BaseTabs from '../components/ScrollTabs.vue'

const route = useRoute()
const router = useRouter()
const curriculumId = computed(() => String(route.params.curriculumId))
const state = useLoad(() => getCurriculum(curriculumId.value), curriculumId)

const versionId = ref<string | undefined>()
watch(
  () => state.data.value?.versions,
  (vs) => {
    if (!vs?.length) versionId.value = undefined
    else if (!vs.some((v) => v.id === versionId.value)) versionId.value = (vs.find((v) => v.status === 'draft') ?? vs[0])?.id
  },
)
const version = computed(() => state.data.value?.versions.find((v) => v.id === versionId.value))
const contents = useLoad(async () => (versionId.value ? versionContents(versionId.value) : null), versionId)

const versionOptions = computed(() =>
  (state.data.value?.versions ?? []).map((v) => ({
    value: v.id,
    label: `Sürüm ${v.version} · ${v.status === 'published' ? 'yayında' : v.status === 'draft' ? 'taslak' : 'arşiv'}`,
  })),
)

type Tab = 'lessons' | 'objectives' | 'sources'
const tabs: TabPanel<Tab>[] = [
  { key: 'lessons', label: 'Dersler' },
  { key: 'objectives', label: 'Hedefler' },
  { key: 'sources', label: 'Kaynaklar' },
]
const tab = ref<Tab>('lessons')
const editing = ref(false)
const assigning = ref(false)
const publishing = ref(false)
const { busy, run } = useAction()

async function publish() {
  const id = versionId.value
  if (!id) return
  const ok = await run(() => publishVersion(id), 'Sürüm yayınlandı')
  publishing.value = false
  if (ok) await state.reload()
}

async function createVersion() {
  let id = ''
  const ok = await run(async () => (id = (await newVersion(curriculumId.value)).id), 'Yeni taslak sürüm oluşturuldu; dersler ve yayınlanmış içerikler kopyalandı')
  if (ok) {
    await state.reload()
    versionId.value = id
  }
}

async function remove() {
  if (await run(() => deleteCurriculum(curriculumId.value), 'Müfredat silindi')) await router.push({ name: 'admin-curricula' })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <RouterLink :to="{ name: 'admin-curricula' }" class="focus-ring rounded-cell text-ink-soft -my-2 inline-flex min-h-10 w-fit items-center type-small hover:underline">‹ Müfredatlar</RouterLink>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <template v-if="state.data.value">
        <PageHeader :title="state.data.value.curriculum.name" as="h1">
          <template #right>
            <div class="flex gap-2">
              <BaseButton variant="secondary" @click="editing = true">Düzenle</BaseButton>
              <BasePopconfirm
                title="Müfredat silinsin mi?"
                message="Atanmış bir sürümü olan müfredat silinemez; arşivleyin."
                confirm-label="Sil"
                cancel-label="Vazgeç"
                tone="danger"
                @confirm="remove"
              >
                <template #trigger="{ props }"><BaseButton variant="quiet" v-bind="props">Sil</BaseButton></template>
              </BasePopconfirm>
            </div>
          </template>
        </PageHeader>
        <p v-if="state.data.value.curriculum.description" class="text-ink-soft -mt-4 max-w-(--measure-reading) type-small">
          {{ state.data.value.curriculum.description }}
        </p>

        <section class="surface rounded-card flex flex-wrap items-end gap-3 p-4" aria-label="Sürüm">
          <BaseSelect v-model="versionId" class="min-w-56" label="Sürüm" :options="versionOptions" />
          <BaseBadge v-if="version" :tone="version.status === 'published' ? 'success' : 'neutral'">
            {{ version.status === 'published' ? `Yayında · ${formatDate(version.published_at)}` : version.status === 'draft' ? 'Taslak — düzenlenebilir' : 'Arşiv' }}
          </BaseBadge>
          <div class="ms-auto flex gap-2">
            <BaseButton v-if="version?.status === 'draft'" @click="publishing = true">Sürümü yayınla</BaseButton>
            <BaseButton v-if="version?.status === 'published'" @click="assigning = true">Öğrencilere ata</BaseButton>
            <BaseButton variant="secondary" :loading="busy" @click="createVersion">Yeni sürüm</BaseButton>
          </div>
        </section>

        <BaseTabs v-if="version" v-model="tab" :items="tabs" label="Sürüm içeriği">
          <template #default="{ active }">
            <div class="pt-4">
              <LoadState :loading="contents.loading.value" :error="contents.error.value" @retry="contents.reload">
                <template v-if="contents.data.value">
                  <LessonList
                    v-if="active === 'lessons'"
                    :version="version"
                    :lessons="contents.data.value.lessons"
                    :objectives="contents.data.value.objectives"
                    @changed="contents.reload"
                  />
                  <ObjectivesEditor
                    v-else-if="active === 'objectives'"
                    :version="version"
                    :objectives="contents.data.value.objectives"
                    @changed="contents.reload"
                  />
                  <SourcesPanel
                    v-else
                    :curriculum-id="curriculumId"
                    :version="version"
                    :lessons="contents.data.value.lessons"
                    :sources="contents.data.value.sources"
                    @changed="contents.reload"
                  />
                </template>
              </LoadState>
            </div>
          </template>
        </BaseTabs>
      </template>
    </LoadState>
    <AssignToStudentsDialog v-if="version?.status === 'published'" v-model="assigning" :version-id="version.id" />
    <CurriculumDialog v-if="state.data.value" v-model="editing" :curriculum="state.data.value.curriculum" @saved="state.reload" />
    <ConfirmDialog
      v-model="publishing"
      title="Sürüm yayınlansın mı?"
      message="Yayınlanan sürüm öğrencilere atanabilir. Bundan sonra derslerin sırası değiştirilemez, ders eklenemez veya silinemez; değişiklik için yeni sürüm oluşturulur."
      confirm-label="Yayınla"
      :busy="busy"
      @confirm="publish"
    />
  </div>
</template>
