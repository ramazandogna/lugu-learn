<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseAlert, BaseButton, BaseCombobox, BaseInput } from 'rei-kit'

import { addSchool, friendlyMessage, searchSchools, type School } from '@/lib/api/student'

/** The chosen school id. `initial` names it before any search has run. */
const model = defineModel<string>({ default: '' })
const { initial, error } = defineProps<{ initial?: Pick<School, 'id' | 'name' | 'city'> | null; error?: string }>()

const results = ref<Pick<School, 'id' | 'name' | 'city' | 'district'>[]>(initial ? [{ ...initial, district: null }] : [])
const loading = ref(false)
const searchError = ref<string | null>(null)
const lastQuery = ref('')

const options = computed(() =>
  results.value.map((s) => ({ value: s.id, label: s.district ? `${s.name} — ${s.district}, ${s.city}` : `${s.name} — ${s.city}` })),
)

async function search(q: string) {
  lastQuery.value = q.trim()
  if (lastQuery.value.length < 2) return
  loading.value = true
  searchError.value = null
  try {
    const rows = await searchSchools(lastQuery.value)
    const chosen = results.value.find((r) => r.id === model.value)
    results.value = chosen && !rows.some((r) => r.id === chosen.id) ? [chosen, ...rows] : rows
  } catch (e) {
    searchError.value = friendlyMessage(e)
  } finally {
    loading.value = false
  }
}

/* Adding a school that is not listed. The server dedupes by normalised name. */
const adding = ref(false)
const name = ref('')
const city = ref('')
const district = ref('')
const addBusy = ref(false)
const addError = ref<string | null>(null)

function openAdd() {
  adding.value = true
  name.value = lastQuery.value
}

async function add() {
  addError.value = null
  if (!name.value.trim() || !city.value.trim()) {
    addError.value = 'Okulunun adını ve şehrini yazmalısın.'
    return
  }
  addBusy.value = true
  try {
    const s = await addSchool(name.value.trim(), city.value.trim(), district.value.trim() || null)
    results.value = [s, ...results.value.filter((r) => r.id !== s.id)]
    model.value = s.id
    adding.value = false
  } catch (e) {
    addError.value = friendlyMessage(e)
  } finally {
    addBusy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <BaseCombobox
      v-model="model"
      label="Okulun"
      :options="options"
      filter="none"
      placeholder="Okulunun adını yazmaya başla"
      empty-label="Bu isimde okul bulamadık"
      loading-label="Okullar aranıyor"
      :loading="loading"
      :error="error ?? searchError ?? undefined"
      hint="En az 2 harf yaz."
      @search="search"
    />
    <BaseButton v-if="!adding" variant="link" class="min-h-11 self-start" @click="openAdd">Okulum listede yok, ekleyeyim</BaseButton>
    <fieldset v-else class="surface rounded-card flex flex-col gap-3 p-4">
      <legend class="type-task text-ink px-1">Yeni okul ekle</legend>
      <BaseAlert v-if="addError" tone="danger">{{ addError }}</BaseAlert>
      <BaseInput v-model="name" label="Okulun adı" autocomplete="off" />
      <BaseInput v-model="city" label="Şehir" autocomplete="address-level1" />
      <BaseInput v-model="district" label="İlçe (isteğe bağlı)" autocomplete="address-level2" />
      <div class="flex flex-wrap gap-2">
        <BaseButton :loading="addBusy" @click="add">Okulu ekle</BaseButton>
        <BaseButton variant="quiet" @click="adding = false">Vazgeç</BaseButton>
      </div>
    </fieldset>
  </div>
</template>
