<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { BaseButton, BaseInput, NumberInput } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { createStudent, type CreatedStudent } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'
import AssignProgramDialog from './AssignProgramDialog.vue'
import CredentialsDialog from './CredentialsDialog.vue'

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ created: [id: string] }>()

const form = reactive({ first_name: '', last_name: '', display_name: '', grade: undefined as number | undefined })
const created = ref<CreatedStudent | null>(null)
const showCredentials = ref(false)
const showAssign = ref(false)
const { busy, run } = useAction()

/* Credentials closed -> offer the optional "assign a program now" step. */
watch(showCredentials, (v, was) => {
  if (was && !v && created.value) showAssign.value = true
})

watch(open, (v) => {
  if (v) Object.assign(form, { first_name: '', last_name: '', display_name: '', grade: undefined })
})

async function submit() {
  const t = (s: string) => s.trim() || undefined
  await run(async () => {
    created.value = await createStudent({
      first_name: t(form.first_name),
      last_name: t(form.last_name),
      display_name: t(form.display_name),
      grade: form.grade,
    })
    open.value = false
    showCredentials.value = true
    emit('created', created.value.student_id)
  }, 'Öğrenci oluşturuldu')
}
</script>

<template>
  <ResponsiveDialog v-model="open" title="Yeni öğrenci" subtitle="Kod ve geçici şifre otomatik üretilir. Diğer bilgileri öğrenci ilk girişte tamamlayabilir." close-label="Kapat">
    <form id="new-student" class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
      <BaseInput v-model="form.first_name" label="Ad" autocomplete="off" />
      <BaseInput v-model="form.last_name" label="Soyad" autocomplete="off" />
      <BaseInput v-model="form.display_name" label="Görünen ad" hint="Öğrencinin uygulamada göreceği ad" autocomplete="off" />
      <NumberInput v-model="form.grade" label="Sınıf" :min="1" :max="12" decrement-label="Azalt" increment-label="Artır" />
    </form>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton type="submit" form="new-student" :loading="busy">Öğrenciyi oluştur</BaseButton>
    </template>
  </ResponsiveDialog>
  <CredentialsDialog v-if="created" v-model="showCredentials" :code="created.student_code" :password="created.password" />
  <AssignProgramDialog
    v-if="created"
    v-model="showAssign"
    :students="[{ id: created.student_id, name: created.student_code }]"
  />
</template>
