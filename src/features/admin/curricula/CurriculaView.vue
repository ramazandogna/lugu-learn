<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { BaseBadge, BaseButton, PageHeader } from 'rei-kit'
import { DataTable, type DataColumn } from 'rei-kit/web'
import { listCurricula, type CurriculumListItem } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { formatDate } from '../lib/format'
import { useLoad } from '../lib/use-load'
import CurriculumDialog from './CurriculumDialog.vue'

const router = useRouter()
const state = useLoad(listCurricula)
const creating = ref(false)

const STATUS: Record<CurriculumListItem['status'], string> = { draft: 'Taslak', active: 'Etkin', archived: 'Arşiv' }
const KIND: Record<CurriculumListItem['kind'], string> = { standard: 'Standart', exam_prep: 'Sınava hazırlık', remedial: 'Telafi', custom: 'Özel' }

type Row = { id: string; name: string; grade: number; kind: string; versions: string; status: CurriculumListItem['status']; updated: string; description: string }
const rows = computed<Row[]>(() =>
  (state.data.value ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description ?? '',
    grade: c.grade ?? 0,
    kind: KIND[c.kind],
    versions: c.publishedVersion ? `${c.versionCount} sürüm · yayında s${c.publishedVersion}` : `${c.versionCount} sürüm · yayında yok`,
    status: c.status,
    updated: formatDate(c.updated_at),
  })),
)
const columns: DataColumn<Row>[] = [
  { key: 'name', label: 'Müfredat', sortable: true },
  { key: 'grade', label: 'Sınıf', sortable: true, align: 'end' },
  { key: 'kind', label: 'Tür' },
  { key: 'versions', label: 'Sürümler' },
  { key: 'status', label: 'Durum' },
  { key: 'updated', label: 'Güncelleme', nowrap: true },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Müfredatlar" as="h1">
      <template #right>
        <BaseButton @click="creating = true"><Plus class="size-4" aria-hidden="true" /> Yeni müfredat</BaseButton>
      </template>
    </PageHeader>
    <LoadState
      :loading="state.loading.value"
      :error="state.error.value"
      :empty="!rows.length"
      empty-title="Henüz müfredat yok"
      empty-description="Bir müfredat oluşturun, derslerini ve kaynaklarını ekleyin; AI her ders için içerik taslağı hazırlayabilir."
      @retry="state.reload"
    >
      <template #emptyAction><BaseButton @click="creating = true">Yeni müfredat</BaseButton></template>
      <DataTable :columns="columns" :rows="rows" caption="Müfredatlar" caption-hidden row-key="id">
        <template #name="{ row }">
          <RouterLink :to="{ name: 'admin-curriculum', params: { curriculumId: row.id } }" class="focus-ring rounded-control font-semibold hover:underline">
            {{ row.name }}
          </RouterLink>
          <p v-if="row.description" class="text-ink-soft line-clamp-1 text-xs">{{ row.description }}</p>
        </template>
        <template #grade="{ row }">{{ row.grade || '—' }}</template>
        <template #status="{ row }">
          <BaseBadge :tone="row.status === 'active' ? 'success' : 'neutral'">{{ STATUS[row.status] }}</BaseBadge>
        </template>
      </DataTable>
    </LoadState>
    <CurriculumDialog v-model="creating" @saved="(id: string) => router.push({ name: 'admin-curriculum', params: { curriculumId: id } })" />
  </div>
</template>
