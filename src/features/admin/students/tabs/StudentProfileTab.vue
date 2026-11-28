<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Trophy } from 'lucide-vue-next'
import { BaseButton, BaseCard, BaseCombobox, BaseInput, BaseSelect, DescriptionList, NumberInput, type ComboboxOption } from 'rei-kit'
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

/* Honor title: shown on the student's home and profile; optional end so "1 hafta" needs no reminder. */
const title = reactive({ text: '', days: 'none' as string })
const DURATIONS = [
  { value: 'none', label: 'Ben kaldırana kadar' },
  { value: '7', label: '1 hafta' },
  { value: '14', label: '2 hafta' },
  { value: '30', label: '1 ay' },
]
const titleActive = computed(() => !!student.honorTitle && (!student.honorTitleUntil || new Date(student.honorTitleUntil) > new Date()))
function resetTitle() {
  title.text = titleActive.value ? (student.honorTitle ?? '') : ''
  title.days = 'none'
}
watch(() => student, resetTitle, { immediate: true })
async function saveTitle(clear = false) {
  const text = clear ? null : t(title.text)
  const until = text && title.days !== 'none' ? new Date(Date.now() + Number(title.days) * 86_400_000).toISOString() : null
  const ok = await run(() => updateStudentProfile(student.id, { honor_title: text, honor_title_until: until }), text ? 'Ünvan verildi' : 'Ünvan kaldırıldı')
  if (ok) emit('saved')
}

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
      <template #head><h2 id="profile-edit" class="type-body font-semibold">Profil bilgileri</h2></template>
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
    <BaseCard class="lg:col-span-2" as="section" aria-labelledby="profile-title">
      <template #head>
        <h2 id="profile-title" class="type-body flex items-center gap-2 font-semibold"><Trophy :size="18" class="text-accent-ink" aria-hidden="true" /> Ünvan</h2>
        <p class="text-ink-soft type-small">
          Öğrencinin ana sayfasında ve profilinde adının altında görünür.
          <template v-if="titleActive">Şu an: <strong class="text-ink">{{ student.honorTitle }}</strong><template v-if="student.honorTitleUntil"> · {{ formatDate(student.honorTitleUntil) }} tarihine kadar</template></template>
        </p>
      </template>
      <form class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]" @submit.prevent="saveTitle()">
        <BaseInput v-model="title.text" label="Ünvan" placeholder="Ör. Küçük Kızlar Tenis İl Birincisi" :maxlength="160" autocomplete="off" />
        <BaseSelect v-model="title.days" label="Ne kadar görünsün?" :options="DURATIONS" />
        <div class="flex flex-wrap gap-2 sm:col-span-2">
          <BaseButton type="submit" :loading="busy" :disabled="!title.text.trim()">{{ titleActive ? 'Ünvanı güncelle' : 'Ünvanı ver' }}</BaseButton>
          <BaseButton v-if="titleActive" variant="secondary" :disabled="busy" @click="saveTitle(true)">Ünvanı kaldır</BaseButton>
        </div>
      </form>
    </BaseCard>
    <BaseCard as="section" aria-labelledby="profile-account">
      <template #head><h2 id="profile-account" class="type-body font-semibold">Hesap</h2></template>
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
