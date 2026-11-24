<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseInput, useDebouncedCallback } from 'rei-kit'
import { DataTable, type DataColumn } from 'rei-kit/web'
import { listSchools, type School } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'
import SchoolDialog from './SchoolDialog.vue'
import SchoolMergeDialog from './SchoolMergeDialog.vue'

const q = ref('')
const term = ref('')
const { run: debounced } = useDebouncedCallback(() => (term.value = q.value), 300)
const state = useLoad(() => listSchools(term.value), term)

type Row = { id: string; name: string; city: string; district: string; country: string; school: School }
const columns: DataColumn<Row>[] = [
  { key: 'name', label: 'Okul', sortable: true },
  { key: 'city', label: 'İl', sortable: true },
  { key: 'district', label: 'İlçe', sortable: true },
  { key: 'id', label: 'İşlemler', align: 'end' },
]
const rows = () => (state.data.value ?? []).map((s) => ({ id: s.id, name: s.name, city: s.city, district: s.district ?? '', country: s.country, school: s }))
const editing = ref<School | null>(null)
const editOpen = ref(false)
const merging = ref<School | null>(null)
const mergeOpen = ref(false)
</script>

<template>
  <div class="flex flex-col gap-4">
    <BaseInput v-model="q" type="search" label="Okul ara" placeholder="Okul adı veya il" @update:model-value="debounced" />
    <LoadState :loading="state.loading.value" :error="state.error.value" :empty="!state.data.value?.length" empty-title="Okul bulunamadı" @retry="state.reload">
      <DataTable :columns="columns" :rows="rows()" caption="Okul kayıtları" caption-hidden row-key="id">
        <template #district="{ row }">{{ row.district || '—' }}</template>
        <template #id="{ row }">
          <div class="flex justify-end gap-1">
            <BaseButton variant="quiet" @click="(editing = row.school), (editOpen = true)">Düzenle</BaseButton>
            <BaseButton variant="quiet" @click="(merging = row.school), (mergeOpen = true)">Birleştir</BaseButton>
          </div>
        </template>
      </DataTable>
    </LoadState>
    <p class="text-ink-soft type-small">Öğrenciler okullarını profil ekranında arayıp ekler; aynı okulun farklı yazımlarını burada birleştirin.</p>
    <SchoolDialog v-if="editing" v-model="editOpen" :school="editing" @saved="state.reload" />
    <SchoolMergeDialog v-if="merging" v-model="mergeOpen" :school="merging" @merged="state.reload" />
  </div>
</template>
