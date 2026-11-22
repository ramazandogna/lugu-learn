<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseAlert, BaseButton, BaseCombobox, type ComboboxOption } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { listSchools, mergeSchools, type School } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'

const open = defineModel<boolean>({ default: false })
const { school } = defineProps<{ school: School }>()
const emit = defineEmits<{ merged: [] }>()
const into = ref<string>('')
const options = ref<ComboboxOption<string>[]>([])
const loading = ref(false)
const { busy, run } = useAction()

watch(open, (v) => {
  if (v) {
    into.value = ''
    options.value = []
  }
})

async function search(q: string) {
  loading.value = true
  try {
    options.value = (await listSchools(q)).filter((s) => s.id !== school.id).map((s) => ({ value: s.id, label: `${s.name} (${s.city}${s.district ? `, ${s.district}` : ''})` }))
  } catch {
    options.value = []
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!into.value) return
  const target = into.value
  const ok = await run(() => mergeSchools(school.id, target), 'Okullar birleştirildi')
  if (ok) {
    open.value = false
    emit('merged')
  }
}
</script>

<template>
  <ResponsiveDialog v-model="open" :title="`${school.name} birleştir`" close-label="Kapat">
    <div class="flex flex-col gap-4">
      <BaseAlert tone="warning">Bu okuldaki tüm öğrenciler seçilen okula taşınır ve bu kayıt seçilen okula yönlendirilir. Geri alınamaz.</BaseAlert>
      <BaseCombobox
        v-model="into"
        label="Hedef okul"
        placeholder="Okul adı yazın"
        :options="options"
        filter="none"
        :loading="loading"
        loading-label="Aranıyor"
        empty-label="Okul bulunamadı"
        @search="search"
      />
    </div>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton variant="danger" :disabled="!into" :loading="busy" @click="submit">Birleştir</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
