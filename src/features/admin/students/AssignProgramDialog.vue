<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseAlert, BaseButton, BaseInput, useToast } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { assignMany, errorMessage, listAssignments, listPublishedVersions, openVersionsByStudent, setOpenLessons, setProgress, type PublishedVersion } from '@/lib/api/admin'
import LessonPicker from '../components/LessonPicker.vue'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'

/*
 * Pick a published curriculum for one or many students: search, choose, "Ata". Every curriculum stays listed.
 * One student who already has it: the dialog edits that program's open lessons instead. Many: those students are skipped.
 */
const open = defineModel<boolean>({ default: false })
const { students } = defineProps<{ students: { id: string; name: string }[] }>()
const emit = defineEmits<{ assigned: [studentIds: string[]] }>()

const router = useRouter()
const toast = useToast()
const state = useLoad(async () => {
  const [versions, open, existing] = await Promise.all([
    listPublishedVersions(),
    openVersionsByStudent(students.map((s) => s.id)),
    students.length === 1 ? listAssignments(students[0]!.id) : Promise.resolve([]),
  ])
  return { versions, open, existing: existing.filter((a) => a.assignment.status === 'active' || a.assignment.status === 'paused') }
})
const q = ref('')
const versionId = ref<string | undefined>()
/** Open lessons (walked in order). Default: only the first; the admin opens more from the Program tab. */
const picked = ref<string[]>([])
const busy = ref(false)

watch(open, (v) => {
  if (!v) return
  q.value = ''
  versionId.value = undefined
  void state.reload()
})

const list = computed(() => {
  const needle = q.value.trim().toLocaleLowerCase('tr')
  return (state.data.value?.versions ?? []).filter((v) => !needle || v.curriculumName.toLocaleLowerCase('tr').includes(needle))
})
watch(list, (l) => {
  if (l.length === 1 && !versionId.value) versionId.value = l[0]!.id
})
const chosen = computed<PublishedVersion | undefined>(() => state.data.value?.versions.find((v) => v.id === versionId.value))
const hasIt = (studentId: string, vid: string) => state.data.value?.open.get(studentId)?.has(vid) ?? false
const already = computed(() => (chosen.value ? students.filter((s) => hasIt(s.id, chosen.value!.id)) : []))
const targets = computed(() => (chosen.value ? students.filter((s) => !hasIt(s.id, chosen.value!.id)) : []))
/** The single student's open program on the chosen version: edited instead of assigned again. */
const existing = computed(() => (students.length === 1 && chosen.value ? state.data.value?.existing.find((a) => a.assignment.curriculum_version_id === chosen.value!.id) : undefined))
watch(chosen, (v) => {
  const ids = existing.value?.assignment.open_lesson_ids
  picked.value = existing.value
    ? (v?.lessons.filter((l) => ids === null || ids?.includes(l.id)).map((l) => l.id) ?? [])
    : v?.lessons[0] ? [v.lessons[0].id] : []
})
async function removeExisting() {
  const e = existing.value
  if (!e || !window.confirm(`"${e.curriculumName}" programı ${students[0]?.name} için kaldırılsın mı? Kayıtlar silinmez, program kapanır.`)) return
  busy.value = true
  try {
    await setProgress(e.assignment.id, 'archive', 'Program ata penceresinden kaldırıldı')
    toast.success(`"${e.curriculumName}" kaldırıldı`)
    emit('assigned', [students[0]!.id])
    versionId.value = undefined
    await state.reload()
  } catch (err) {
    toast.danger(errorMessage(err), { duration: 0 })
  } finally {
    busy.value = false
  }
}
async function update() {
  const e = existing.value
  if (!e) return
  busy.value = true
  try {
    await setOpenLessons(e.assignment.id, picked.value)
    toast.success(`${students[0]?.name}: "${e.curriculumName}" dersleri güncellendi`)
    emit('assigned', [students[0]!.id])
    open.value = false
  } catch (err) {
    toast.danger(errorMessage(err), { duration: 0 })
  } finally {
    busy.value = false
  }
}

async function submit() {
  const v = chosen.value
  if (!v || !targets.value.length) return
  busy.value = true
  try {
    const res = await assignMany(
      targets.value.map((s) => s.id),
      v.id,
      picked.value,
    )
    const name = (id: string) => students.find((s) => s.id === id)?.name ?? id
    if (res.ok.length) {
      const only = res.ok.length === 1 ? res.ok[0] : undefined
      toast.success(only ? `${name(only)} için "${v.curriculumName}" atandı` : `"${v.curriculumName}" ${res.ok.length} öğrenciye atandı`, {
        duration: 8000,
        action: only
          ? { label: 'Programı aç', onClick: () => void router.push({ name: 'admin-student', params: { studentId: only }, query: { sekme: 'program' } }) }
          : undefined,
      })
      emit('assigned', res.ok)
    }
    for (const f of res.failed.slice(0, 3)) toast.danger(`${name(f.studentId)}: ${errorMessage(f.error)}`, { duration: 0 })
    if (res.failed.length > 3) toast.danger(`${res.failed.length - 3} öğrenci için daha atama başarısız oldu.`, { duration: 0 })
    if (!res.failed.length) open.value = false
  } finally {
    busy.value = false
  }
}

const title = computed(() => (students.length === 1 ? `Program ata · ${students[0]?.name}` : `Program ata · ${students.length} öğrenci`))
</script>

<template>
  <ResponsiveDialog v-model="open" :title="title" close-label="Kapat">
    <p v-if="students.length === 1" class="text-ink-soft type-small -mt-2 mb-3">Yeni program eklemek için seçip "Ata"ya basın. "Atanmış" bir programı seçerseniz derslerini düzenleyebilir ya da programı kaldırabilirsiniz.</p>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <div v-if="state.data.value" class="flex flex-col gap-4">
        <p v-if="!state.data.value.versions.length" class="text-ink-soft type-small">
          Yayınlanmış müfredat sürümü yok. Önce Müfredatlar bölümünde bir sürümü yayınlayın.
        </p>
        <template v-else>
          <BaseInput v-model="q" type="search" label="Müfredat ara" placeholder="Müfredat adı" />
          <ul class="flex max-h-64 flex-col gap-2 overflow-y-auto" aria-label="Müfredatlar">
            <li v-for="v in list" :key="v.id">
              <button
                type="button"
                class="focus-ring rounded-tile border-hair flex min-h-12 w-full items-center justify-between gap-3 border px-3 py-2 text-start"
                :class="v.id === versionId ? 'bg-muted border-ink font-semibold' : ''"
                :aria-pressed="v.id === versionId"
                @click="versionId = v.id"
              >
                <span class="min-w-0">{{ v.curriculumName }}</span>
                <span class="text-ink-soft type-small shrink-0">
                  <span v-if="students.length === 1 && hasIt(students[0]!.id, v.id)" class="bg-wash text-primary rounded-control me-2 px-2 py-0.5 font-semibold">Atanmış</span>
                  sürüm {{ v.version }} · {{ v.lessons.length }} ders
                </span>
              </button>
            </li>
            <li v-if="!list.length" class="text-ink-soft type-small">Eşleşen müfredat yok.</li>
          </ul>
          <div v-if="chosen" class="flex flex-col gap-2">
            <h3 class="type-body font-semibold">{{ existing ? 'Bu program zaten atanmış: açık dersleri düzenleyin' : 'Hangi dersler açık olsun?' }}</h3>
            <p class="text-ink-soft type-small">
              İşaretlediğiniz dersler sırayla açılır; öğrenci birini bitirince sıradakine geçer. Diğerlerini öğrenci kilitli görür; sonradan
              öğrenci profilindeki Program sekmesinden açabilirsiniz.
            </p>
            <LessonPicker v-model="picked" :lessons="chosen.lessons" :completed="existing?.completedLessonIds" :current="existing?.assignment.current_lesson_id ?? null" />
          </div>
          <BaseAlert v-if="chosen && already.length && students.length > 1" tone="warning">
            <template v-if="true">{{ already.length }} öğrencide bu program zaten açık; atlanacak ({{ already.map((s) => s.name).slice(0, 3).join(', ') }}{{ already.length > 3 ? '…' : '' }}).</template>
          </BaseAlert>
        </template>
      </div>
    </LoadState>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton v-if="existing" variant="danger" :loading="busy" @click="removeExisting">Programı kaldır</BaseButton>
      <BaseButton v-if="existing" :disabled="!picked.length" :loading="busy" @click="update">Dersleri güncelle</BaseButton>
      <BaseButton v-else :disabled="!chosen || !targets.length || !picked.length" :loading="busy" @click="submit">
        {{ targets.length > 1 ? `${targets.length} öğrenciye ata` : 'Ata' }}
      </BaseButton>
    </template>
  </ResponsiveDialog>
</template>
