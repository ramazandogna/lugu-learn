<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton } from 'rei-kit'
import LoadState from '../components/LoadState.vue'
import PageHeader from '../components/AdminPageHeader.vue'
import { useLoad } from '../lib/use-load'
import AssignToStudentsDialog from './AssignToStudentsDialog.vue'
import { listCurriculumSummaries } from './data'

const state = useLoad(listCurriculumSummaries)
const assignId = ref<string | null>(null)
const assigning = ref(false)
function assign(versionId: string) {
  assignId.value = versionId
  assigning.value = true
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Müfredat" as="h1" />
    <LoadState :loading="state.loading.value" :error="state.error.value" :empty="!state.data.value?.length" empty-title="Henüz müfredat yok" @retry="state.reload">
      <ul class="flex flex-col gap-2">
        <li v-for="c in state.data.value" :key="c.id" class="surface rounded-card flex flex-wrap items-center gap-3 p-3">
          <div class="min-w-48 flex-1">
            <RouterLink :to="{ name: 'admin-curriculum', params: { curriculumId: c.id } }" class="focus-ring rounded-cell font-semibold hover:underline">{{ c.name }}</RouterLink>
            <p class="text-ink-soft type-small">sürüm {{ c.version ?? '—' }} · {{ c.lessonCount }} ders</p>
          </div>
          <BaseButton v-if="c.publishedVersionId" size="sm" @click="assign(c.publishedVersionId)">Öğrencilere ata</BaseButton>
        </li>
      </ul>
    </LoadState>
    <AssignToStudentsDialog v-if="assigning && assignId" v-model="assigning" :version-id="assignId" />
  </div>
</template>
