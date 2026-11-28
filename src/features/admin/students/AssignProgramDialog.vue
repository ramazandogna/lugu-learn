<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseAlert, BaseButton, BaseInput, BaseSwitch, useToast } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { assignMany, errorMessage, listPublishedVersions, openVersionsByStudent, type PublishedVersion } from '@/lib/api/admin'
import LessonPicker from '../components/LessonPicker.vue'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'

/* Pick a published curriculum for one or many students: search, choose, "Ata". Students who already have it open are skipped. */
const open = defineModel<boolean>({ default: false })
const { students } = defineProps<{ students: { id: string; name: string }[] }>()
const emit = defineEmits<{ assigned: [studentIds: string[]] }>()

const router = useRouter()
const toast = useToast()
const state = useLoad(async () => {
  const [versions, open] = await Promise.all([listPublishedVersions(), openVersionsByStudent(students.map((s) => s.id))])
  return { versions, open }
})
const q = ref('')
const versionId = ref<string | undefined>()
/** Open lessons (walked in order). Default: only the first; the admin opens more from the Program tab. */
const picked = ref<string[]>([])
const allOpen = ref(false)
const busy = ref(false)

watch(open, (v) => {
  if (!v) return
  q.value = ''
  versionId.value = undefined
  void state.reload()
})

const list = computed(() => {
  const needle = q.value.trim().toLocaleLowerCase('tr')
  const all = state.data.value?.versions ?? []
  /* One student: hide what they already have open (it could not be assigned again). */
  const usable = students.length === 1 ? all.filter((v) => !hasIt(students[0]!.id, v.id)) : all
  return usable.filter((v) => !needle || v.curriculumName.toLocaleLowerCase('tr').includes(needle))
})
watch(list, (l) => {
  if (l.length === 1 && !versionId.value) versionId.value = l[0]!.id
})
const chosen = computed<PublishedVersion | undefined>(() => state.data.value?.versions.find((v) => v.id === versionId.value))
const hasIt = (studentId: string, vid: string) => state.data.value?.open.get(studentId)?.has(vid) ?? false
const already = computed(() => (chosen.value ? students.filter((s) => hasIt(s.id, chosen.value!.id)) : []))
const targets = computed(() => (chosen.value ? students.filter((s) => !hasIt(s.id, chosen.value!.id)) : []))
watch(chosen, (v) => {
  picked.value = v?.lessons[0] ? [v.lessons[0].id] : []
  allOpen.value = false
})

async function submit() {
  const v = chosen.value
  if (!v || !targets.value.length) return
  busy.value = true
  try {
    const res = await assignMany(
      targets.value.map((s) => s.id),
      v.id,
      allOpen.value ? null : picked.value,
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
                <span class="text-ink-soft type-small shrink-0">sürüm {{ v.version }} · {{ v.lessons.length }} ders</span>
              </button>
            </li>
            <li v-if="!list.length" class="text-ink-soft type-small">Eşleşen müfredat yok.</li>
          </ul>
          <div v-if="chosen" class="flex flex-col gap-2">
            <h3 class="type-body font-semibold">Hangi dersler açık olsun?</h3>
            <p class="text-ink-soft type-small">
              İşaretlediğiniz dersler sırayla açılır; öğrenci birini bitirince sıradakine geçer. Diğerlerini öğrenci kilitli görür; sonradan
              öğrenci profilindeki Program sekmesinden açabilirsiniz.
            </p>
            <BaseSwitch v-model="allOpen" label="Seçim yapma: tüm dersler sırayla açılsın" />
            <LessonPicker v-if="!allOpen" v-model="picked" :lessons="chosen.lessons" />
          </div>
          <BaseAlert v-if="chosen && already.length" tone="warning">
            <template v-if="students.length === 1">Bu öğrencide bu program zaten açık. Önce mevcut atamayı arşivleyin ya da başka bir müfredat seçin.</template>
            <template v-else>{{ already.length }} öğrencide bu program zaten açık; atlanacak ({{ already.map((s) => s.name).slice(0, 3).join(', ') }}{{ already.length > 3 ? '…' : '' }}).</template>
          </BaseAlert>
        </template>
      </div>
    </LoadState>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton :disabled="!chosen || !targets.length || (!allOpen && !picked.length)" :loading="busy" @click="submit">
        {{ targets.length > 1 ? `${targets.length} öğrenciye ata` : 'Ata' }}
      </BaseButton>
    </template>
  </ResponsiveDialog>
</template>
