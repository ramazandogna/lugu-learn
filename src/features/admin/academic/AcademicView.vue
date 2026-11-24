<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseCard, BaseSelect } from 'rei-kit'
import { listStudents } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'
import StudentAcademicPanel from './StudentAcademicPanel.vue'
import SubjectsCard from './SubjectsCard.vue'
import EmptyState from '../components/AdminEmpty.vue'
import PageHeader from '../components/AdminPageHeader.vue'

const route = useRoute()
const router = useRouter()
const students = useLoad(listStudents)

const studentId = computed<string | undefined>({
  get: () => (typeof route.query.ogrenci === 'string' ? route.query.ogrenci : undefined),
  set: (v) => void router.replace({ query: { ...route.query, ogrenci: v } }),
})
const options = computed(() => (students.data.value ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })))
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Akademik Takip" as="h1" />
    <div class="grid gap-4 xl:grid-cols-[1fr_2fr]">
      <SubjectsCard class="h-fit" />
      <div class="flex flex-col gap-4">
        <BaseCard as="section" aria-labelledby="ac-student">
          <template #head><h2 id="ac-student" class="type-body font-semibold">Öğrenci</h2></template>
          <LoadState :loading="students.loading.value" :error="students.error.value" :empty="!options.length" empty-title="Henüz öğrenci yok" @retry="students.reload">
            <BaseSelect v-model="studentId" label="Öğrenci seçin" label-hidden placeholder="Öğrenci seçin" :options="options" />
          </LoadState>
        </BaseCard>
        <StudentAcademicPanel v-if="studentId" :key="studentId" :student-id="studentId" />
        <EmptyState v-else title="Sınavları ve eğilimleri görmek için bir öğrenci seçin" />
      </div>
    </div>
  </div>
</template>
