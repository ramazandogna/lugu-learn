<script setup lang="ts">
import { reactive, watch } from 'vue'
import { BaseButton, BaseInput } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { updateSchool, type School } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'

const open = defineModel<boolean>({ default: false })
const { school } = defineProps<{ school: School }>()
const emit = defineEmits<{ saved: [] }>()
const form = reactive({ name: '', city: '', district: '', country: '' })
const { busy, run } = useAction()

watch(open, (v) => v && Object.assign(form, { name: school.name, city: school.city, district: school.district ?? '', country: school.country }), { immediate: true })

async function submit() {
  if (!form.name.trim() || !form.city.trim()) return
  const ok = await run(
    () => updateSchool(school.id, { name: form.name.trim(), city: form.city.trim(), district: form.district.trim() || null, country: form.country.trim() || 'Türkiye' }),
    'Okul güncellendi',
  )
  if (ok) {
    open.value = false
    emit('saved')
  }
}
</script>

<template>
  <ResponsiveDialog v-model="open" title="Okulu düzenle" close-label="Kapat" subtitle="Aynı ad, il ve ilçeye sahip başka bir kayıt varsa kayıt reddedilir; o durumda birleştirin.">
    <form id="school-form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
      <BaseInput v-model="form.name" class="sm:col-span-2" label="Okul adı" />
      <BaseInput v-model="form.city" label="İl" />
      <BaseInput v-model="form.district" label="İlçe" />
      <BaseInput v-model="form.country" label="Ülke" />
    </form>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton type="submit" form="school-form" :loading="busy" :disabled="!form.name.trim() || !form.city.trim()">Kaydet</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
