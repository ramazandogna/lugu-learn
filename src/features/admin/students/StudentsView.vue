<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseInput, BaseSelect, PageHeader } from 'rei-kit'
import { DataTable, type DataColumn, type TableSort } from 'rei-kit/web'
import { listStudents, type StudentSummary } from '@/lib/api/admin'
import type { AccountStatus } from '@/lib/database.types'
import LoadState from '../components/LoadState.vue'
import { ACCOUNT_STATUS, ACCOUNT_TONE, formatDateTime } from '../lib/format'
import { EMPTY_FILTERS, filterOptions, filterStudents, type StudentFilters } from '../lib/student-filters'
import { useLoad } from '../lib/use-load'
import NewStudentDialog from './NewStudentDialog.vue'
import StudentAccountActions from './StudentAccountActions.vue'

const { data, loading, error, reload } = useLoad(listStudents)
const filters = reactive<StudentFilters>({ ...EMPTY_FILTERS })
const creating = ref(false)

const options = computed(() => filterOptions(data.value ?? []))
const statusOptions = (Object.keys(ACCOUNT_STATUS) as AccountStatus[]).map((s) => ({ value: s, label: ACCOUNT_STATUS[s] }))

type Row = {
  id: string
  name: string
  code: string
  grade: number
  school: string
  lesson: string
  status: AccountStatus
  lastActivity: number
  summary: StudentSummary
}

const rows = computed<Row[]>(() =>
  filterStudents(data.value ?? [], filters).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    grade: s.grade ?? 0,
    school: s.school?.name ?? '',
    lesson: s.program?.currentLesson ? `${s.program.currentLesson.sequence}. ${s.program.currentLesson.title}` : '',
    status: s.status,
    lastActivity: s.lastActivityAt ? Date.parse(s.lastActivityAt) : 0,
    summary: s,
  })),
)

const columns: DataColumn<Row>[] = [
  { key: 'name', label: 'Öğrenci', sortable: true },
  { key: 'grade', label: 'Sınıf', sortable: true, align: 'end' },
  { key: 'school', label: 'Okul', sortable: true },
  { key: 'lesson', label: 'Program / şu anki ders' },
  { key: 'status', label: 'Durum', sortable: true },
  { key: 'lastActivity', label: 'Son etkinlik', sortable: true, nowrap: true },
  { key: 'id', label: 'İşlemler', align: 'end' },
]
const sort = ref<TableSort<Row> | undefined>({ key: 'lastActivity', direction: 'desc' })
const hasFilters = computed(() => JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS))
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Öğrenciler" as="h1">
      <template #right>
        <BaseButton @click="creating = true"><Plus class="size-4" aria-hidden="true" /> Yeni öğrenci</BaseButton>
      </template>
    </PageHeader>

    <section aria-label="Filtreler" class="surface rounded-card grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
      <BaseInput v-model="filters.q" class="md:col-span-3 xl:col-span-1" type="search" label="Ara" placeholder="Ad, kod veya okul" />
      <BaseSelect v-model="filters.grade" label="Sınıf" placeholder="Tümü" :options="options.grades" />
      <BaseSelect v-model="filters.schoolId" label="Okul" placeholder="Tümü" :options="options.schools" />
      <BaseSelect v-model="filters.curriculumId" label="Program" placeholder="Tümü" :options="options.programs" />
      <BaseSelect v-model="filters.lessonId" label="Şu anki ders" placeholder="Tümü" :options="options.lessons" />
      <BaseSelect v-model="filters.status" label="Durum" placeholder="Tümü" :options="statusOptions" />
      <div v-if="hasFilters" class="md:col-span-3 xl:col-span-6">
        <BaseButton variant="link" @click="Object.assign(filters, EMPTY_FILTERS)">Filtreleri temizle</BaseButton>
      </div>
    </section>

    <LoadState
      :loading="loading"
      :error="error"
      :empty="!data?.length"
      empty-title="Henüz öğrenci yok"
      empty-description="İlk öğrenciyi oluşturduğunuzda kodu ve geçici şifresi burada gösterilir."
      @retry="reload"
    >
      <template #emptyAction><BaseButton @click="creating = true">Yeni öğrenci</BaseButton></template>
      <DataTable v-model:sort="sort" :columns="columns" :rows="rows" caption="Öğrenci listesi" caption-hidden row-key="id">
        <template #name="{ row }">
          <RouterLink :to="{ name: 'admin-student', params: { studentId: row.id } }" class="focus-ring rounded-cell font-semibold hover:underline">
            {{ row.name }}
          </RouterLink>
          <div class="text-ink-soft type-small">{{ row.code }}</div>
        </template>
        <template #grade="{ row }">{{ row.grade || '—' }}</template>
        <template #school="{ row }">{{ row.school || '—' }}</template>
        <template #lesson="{ row }">
          <template v-if="row.summary.program">
            <div class="type-small">{{ row.summary.program.curriculumName }}</div>
            <div class="text-ink-soft type-small">{{ row.lesson || 'Program tamamlandı' }}</div>
          </template>
          <span v-else class="text-ink-soft type-small">Program atanmadı</span>
        </template>
        <template #status="{ row }"><BaseBadge :tone="ACCOUNT_TONE[row.status]">{{ ACCOUNT_STATUS[row.status] }}</BaseBadge></template>
        <template #lastActivity="{ row }">{{ row.lastActivity ? formatDateTime(row.summary.lastActivityAt) : 'Hiç' }}</template>
        <template #id="{ row }">
          <StudentAccountActions :student-id="row.id" :code="row.code" :name="row.name" :status="row.status" @changed="reload" />
        </template>
        <template #empty>Filtrelere uyan öğrenci yok.</template>
      </DataTable>
    </LoadState>

    <NewStudentDialog v-model="creating" @created="reload" />
  </div>
</template>
