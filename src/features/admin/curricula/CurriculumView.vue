<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { BaseButton } from 'rei-kit'
import { getCurriculum } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import PageHeader from '../components/AdminPageHeader.vue'
import { useLoad } from '../lib/use-load'
import AssignToStudentsDialog from './AssignToStudentsDialog.vue'
import { listLessonRows, pickVersion } from './data'
import LessonList from './LessonList.vue'

const route = useRoute()
const curriculumId = computed(() => String(route.params.curriculumId))
const state = useLoad(async () => {
  const { curriculum, versions } = await getCurriculum(curriculumId.value)
  const version = pickVersion(versions) ?? null
  return { curriculum, version, rows: version ? await listLessonRows(version.id) : [] }
}, curriculumId)
const assigning = ref(false)
</script>

<template>
  <div class="flex flex-col gap-6">
    <RouterLink :to="{ name: 'admin-curricula' }" class="focus-ring rounded-cell text-ink-soft -my-2 inline-flex min-h-10 w-fit items-center type-small hover:underline">‹ Müfredat</RouterLink>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <template v-if="state.data.value">
        <PageHeader :title="state.data.value.curriculum.name" as="h1">
          <template #right>
            <BaseButton v-if="state.data.value.version?.status === 'published'" @click="assigning = true">Öğrencilere ata</BaseButton>
          </template>
        </PageHeader>
        <p class="text-ink-soft -mt-4 type-small">
          sürüm {{ state.data.value.version?.version ?? '—' }} · {{ state.data.value.rows.length }} ders
          <template v-if="state.data.value.curriculum.description"> · {{ state.data.value.curriculum.description }}</template>
        </p>
        <LessonList :rows="state.data.value.rows" />
        <AssignToStudentsDialog v-if="assigning && state.data.value.version" v-model="assigning" :version-id="state.data.value.version.id" />
      </template>
    </LoadState>
  </div>
</template>
