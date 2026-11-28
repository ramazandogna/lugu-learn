<script setup lang="ts">
import { AvatarArt } from '@/design'
import { isAvatarKey } from '@/features/student/profile'
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ListFilter, Plus, Search } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseCheckbox, BaseSelect } from 'rei-kit'
import { listStudents, type StudentSummary } from '@/lib/api/admin'
import type { AccountStatus } from '@/lib/database.types'
import LoadState from '../components/LoadState.vue'
import { ACCOUNT_STATUS, ACCOUNT_TONE, formatDateTime } from '../lib/format'
import { EMPTY_FILTERS, filterOptions, filterStudents, type StudentFilters } from '../lib/student-filters'
import { useLoad } from '../lib/use-load'
import AssignProgramDialog from './AssignProgramDialog.vue'
import NewStudentDialog from './NewStudentDialog.vue'
import PageHeader from '../components/AdminPageHeader.vue'

const { data, loading, error, reload } = useLoad(listStudents)
const filters = reactive<StudentFilters>({ ...EMPTY_FILTERS })
const creating = ref(false)
const showFilters = ref(false)
const assignFor = ref<{ id: string; name: string }[]>([])
const assigning = ref(false)
const picked = ref(new Set<string>())
function assign(list: { id: string; name: string }[]) {
  assignFor.value = list
  assigning.value = true
}
function toggle(id: string, on: boolean) {
  const next = new Set(picked.value)
  if (on) next.add(id)
  else next.delete(id)
  picked.value = next
}
function onAssigned() {
  picked.value = new Set()
  void reload()
}

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
  sel: string
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
    sel: s.id,
  })),
)

const sortOptions = [
  { value: 'lastActivity', label: 'Son etkinlik' },
  { value: 'name', label: 'Ada göre' },
  { value: 'grade', label: 'Sınıfa göre' },
]
const sortKey = ref<'lastActivity' | 'name' | 'grade'>('lastActivity')
const sorted = computed(() => {
  const k = sortKey.value
  return [...rows.value].sort((x, y) => (k === 'name' ? x.name.localeCompare(y.name, 'tr') : k === 'grade' ? x.grade - y.grade : y.lastActivity - x.lastActivity))
})
const hasFilters = computed(() => JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS))
const pickedList = computed(() => rows.value.filter((r) => picked.value.has(r.id)).map((r) => ({ id: r.id, name: r.name })))
const allOn = computed(() => rows.value.length > 0 && rows.value.every((r) => picked.value.has(r.id)))
function toggleAll(on: boolean) {
  const next = new Set(picked.value)
  for (const r of rows.value) {
    if (on) next.add(r.id)
    else next.delete(r.id)
  }
  picked.value = next
}
const activeCount = computed(() => (Object.keys(EMPTY_FILTERS) as (keyof StudentFilters)[]).filter((k) => k !== 'q' && filters[k] !== EMPTY_FILTERS[k]).length)
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Öğrenciler" as="h1">
      <template #right>
        <BaseButton class="whitespace-nowrap" @click="creating = true"><Plus class="size-4" aria-hidden="true" /> Yeni öğrenci</BaseButton>
      </template>
    </PageHeader>

    <section aria-label="Arama ve filtre" class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <label class="bg-muted rounded-full focus-within:ring-primary flex min-h-11 min-w-0 flex-1 items-center gap-2 px-4 focus-within:ring-2">
          <Search class="text-ink-soft size-4 shrink-0" aria-hidden="true" />
          <span class="sr-only">Öğrenci ara</span>
          <input v-model="filters.q" type="search" class="type-body min-w-0 flex-1 bg-transparent outline-none" placeholder="Ad, kod veya okul ara…" />
        </label>
        <BaseButton
          class="shrink-0 whitespace-nowrap"
          variant="secondary"
          :aria-expanded="showFilters"
          aria-controls="student-filters"
          @click="showFilters = !showFilters"
        >
          <ListFilter class="size-4" aria-hidden="true" /> Filtre<template v-if="activeCount"> ({{ activeCount }})</template>
        </BaseButton>
      </div>
      <div id="student-filters" class="grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5" :class="showFilters ? 'grid' : 'hidden'">
        <BaseSelect v-model="filters.grade" label="Sınıf" placeholder="Tümü" :options="options.grades" />
        <BaseSelect v-model="filters.schoolId" label="Okul" placeholder="Tümü" :options="options.schools" />
        <BaseSelect v-model="filters.curriculumId" label="Program" placeholder="Tümü" :options="options.programs" />
        <BaseSelect v-model="filters.lessonId" label="Şu anki ders" placeholder="Tümü" :options="options.lessons" />
        <BaseSelect v-model="filters.status" label="Durum" placeholder="Tümü" :options="statusOptions" />
      </div>
      <div v-if="hasFilters">
        <BaseButton variant="link" @click="Object.assign(filters, EMPTY_FILTERS)">Filtreleri temizle</BaseButton>
      </div>
    </section>

    <div v-if="pickedList.length" class="surface rounded-card sticky top-[calc(var(--header-h)+0.5rem)] z-10 flex flex-wrap items-center justify-between gap-2 p-3" role="region" aria-label="Toplu işlem">
      <span class="type-small font-semibold">{{ pickedList.length }} öğrenci seçili</span>
      <div class="flex gap-2">
        <BaseButton variant="quiet" @click="picked = new Set()">Seçimi temizle</BaseButton>
        <BaseButton @click="assign(pickedList)">Seçilenlere ata</BaseButton>
      </div>
    </div>

    <LoadState
      :loading="loading"
      :error="error"
      :empty="!data?.length"
      empty-title="Henüz öğrenci yok"
      empty-description="İlk öğrenciyi oluşturduğunuzda kodu ve geçici şifresi burada gösterilir."
      @retry="reload"
    >
      <template #emptyAction><BaseButton @click="creating = true">Yeni öğrenci</BaseButton></template>
      <div v-if="rows.length" class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <BaseCheckbox :model-value="allOn" label="Hepsini seç" @update:model-value="(v: boolean) => toggleAll(v)" />
        <BaseSelect v-model="sortKey" class="w-48" label="Sırala" label-hidden :options="sortOptions" />
      </div>
      <ul v-if="rows.length" class="grid gap-3 lg:grid-cols-2" aria-label="Öğrenci listesi">
        <li v-for="r in sorted" :key="r.id" class="surface rounded-card hover:border-primary relative flex flex-col gap-2 border border-transparent p-4 transition-colors duration-150">
          <div class="flex items-start gap-3">
            <BaseCheckbox class="relative z-[1] -m-3 shrink-0 p-3" :model-value="picked.has(r.id)" :label="`${r.name} seç`" label-hidden @update:model-value="(v: boolean) => toggle(r.id, v)" />
            <AvatarArt v-if="isAvatarKey(r.summary.avatarKey)" class="shrink-0" :avatar="r.summary.avatarKey" :size="40" />
            <div class="min-w-0 flex-1">
              <RouterLink :to="{ name: 'admin-student', params: { studentId: r.id } }" class="focus-ring rounded-cell font-semibold after:absolute after:inset-0 after:content-['']">
                {{ r.name }}
              </RouterLink>
              <p class="text-ink-soft type-small">{{ r.code }}<template v-if="r.grade"> · {{ r.grade }}. sınıf</template><template v-if="r.school"> · {{ r.school }}</template></p>
            </div>
            <BaseBadge :tone="ACCOUNT_TONE[r.status]">{{ ACCOUNT_STATUS[r.status] }}</BaseBadge>
          </div>
          <p class="type-small">
            <template v-if="r.summary.program">{{ r.summary.program.curriculumName }} · <span class="text-ink-soft">{{ r.lesson || 'Program tamamlandı' }}</span></template>
            <span v-else class="text-ink-soft">Program atanmadı</span>
          </p>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-ink-soft type-small">Son etkinlik: {{ r.lastActivity ? formatDateTime(r.summary.lastActivityAt) : 'Hiç' }}</span>
            <BaseButton size="sm" variant="secondary" class="relative z-[1]" @click="assign([{ id: r.id, name: r.name }])">Program ata</BaseButton>
          </div>
        </li>
      </ul>
      <p v-else class="text-ink-soft type-small">Filtrelere uyan öğrenci yok.</p>
    </LoadState>

    <NewStudentDialog v-model="creating" @created="reload" />
    <AssignProgramDialog v-if="assigning" v-model="assigning" :students="assignFor" @assigned="onAssigned" />
  </div>
</template>
