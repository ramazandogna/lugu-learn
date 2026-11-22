<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { BaseButton, BaseCard, BaseCombobox, BaseInput, DescriptionList, NumberInput, type ComboboxOption } from 'rei-kit'
import { createDeletionRequest, searchSchools, updateStudentProfile, type StudentSummary } from '@/lib/api/admin'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { formatDate } from '../../lib/format'
import { useAction } from '../../lib/use-load'

const { student } = defineProps<{ student: StudentSummary }>()
const emit = defineEmits<{ saved: [] }>()

const form = reactive({ first_name: '', last_name: '', display_name: '', grade: undefined as number | undefined, school_id: '' as string })
const schoolOptions = ref<ComboboxOption<string>[]>([])
const searching = ref(false)
const { busy, run } = useAction()
const deletion = ref(false)

function resetForm() {
  Object.assign(form, {
    first_name: student.firstName ?? '',
    last_name: student.lastName ?? '',
    display_name: student.displayName ?? '',
    grade: student.grade ?? undefined,
    school_id: student.school?.id ?? '',
  })
  schoolOptions.value = student.school ? [{ value: student.school.id, label: `${student.school.name} (${student.school.city})` }] : []
}
watch(() => student, resetForm, { immediate: true })

async function onSearch(q: string) {
  if (q.trim().length < 2) return
  searching.value = true
  try {
    const found = await searchSchools(q)
    const current = schoolOptions.value.filter((o) => o.value === form.school_id)
    schoolOptions.value = [...current, ...found.filter((s) => s.id !== form.school_id).map((s) => ({ value: s.id, label: `${s.name} (${s.city})` }))]
  } catch {
    // The combobox keeps its last list; a failed lookup is not worth a toast while typing.
  } finally {
    searching.value = false
  }
}

const t = (s: string) => s.trim() || null
async function save() {
  const ok = await run(
    () =>
      updateStudentProfile(student.id, {
        first_name: t(form.first_name),
        last_name: t(form.last_name),
        display_name: t(form.display_name),
        grade: form.grade ?? null,
        school_id: form.school_id || null,
      }),
    'Profil kaydedildi',
  )
  if (ok) emit('saved')
}

async function requestDeletion(reason: string) {
  const ok = await run(() => createDeletionRequest(student.id, student.code, reason), 'Silme talebi oluşturuldu; Ayarlar › Veri silme bölümünden onaylayabilirsiniz')
  if (ok) deletion.value = false
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <BaseCard class="lg:col-span-2" as="section" aria-labelledby="profile-edit">
      <template #head><h2 id="profile-edit" class="text-base font-semibold">Profil bilgileri</h2></template>
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="save">
        <BaseInput v-model="form.first_name" label="Ad" autocomplete="off" />
        <BaseInput v-model="form.last_name" label="Soyad" autocomplete="off" />
        <BaseInput v-model="form.display_name" label="Görünen ad" autocomplete="off" />
        <NumberInput v-model="form.grade" label="Sınıf" :min="1" :max="12" decrement-label="Azalt" increment-label="Artır" />
        <BaseCombobox
          v-model="form.school_id"
          class="sm:col-span-2"
          label="Okul"
          placeholder="Okul adı yazın"
          :options="schoolOptions"
          filter="none"
          :loading="searching"
          loading-label="Aranıyor"
          empty-label="Okul bulunamadı. Okullar öğrencinin profil ekranından veya Ayarlar › Okullar bölümünden eklenir."
          @search="onSearch"
        />
        <div class="flex gap-2 sm:col-span-2">
          <BaseButton type="submit" :loading="busy">Kaydet</BaseButton>
          <BaseButton variant="secondary" @click="resetForm">Değişiklikleri geri al</BaseButton>
        </div>
      </form>
    </BaseCard>
    <BaseCard as="section" aria-labelledby="profile-account">
      <template #head><h2 id="profile-account" class="text-base font-semibold">Hesap</h2></template>
      <DescriptionList
        :items="[
          { term: 'Öğrenci kodu', description: student.code },
          { term: 'Oluşturulma', description: formatDate(student.createdAt) },
          { term: 'Profil tamamlandı', description: student.profileCompletedAt ? formatDate(student.profileCompletedAt) : 'Henüz değil' },
          { term: 'İlk giriş şifresi', description: student.mustChangePassword ? 'Değiştirilmedi' : 'Değiştirildi' },
        ]"
      />
      <template #foot>
        <BaseButton variant="link" @click="deletion = true">Veri silme talebi oluştur</BaseButton>
      </template>
    </BaseCard>
    <ConfirmDialog
      v-model="deletion"
      title="Veri silme talebi"
      message="Talep oluşturulur; öğrencinin tüm verileri ancak Ayarlar › Veri silme bölümünde öğrenci kodu yazılarak onaylandığında kalıcı olarak silinir."
      confirm-label="Talep oluştur"
      tone="danger"
      with-note
      note-label="Gerekçe"
      :busy="busy"
      @confirm="requestDeletion"
    />
  </div>
</template>
