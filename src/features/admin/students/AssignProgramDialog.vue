<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseAlert, BaseButton, BaseInput, BaseSelect, BaseSwitch, useToast } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { assignMany, errorMessage, listPublishedVersions, openVersionsByStudent, type PublishedVersion } from '@/lib/api/admin'
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
const startLessonId = ref<string | undefined>()
/** Teacher gate on by default: the next lesson waits until the admin opens it. */
const gated = ref(true)
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
const chosen = computed<PublishedVersion | undefined>(() => state.data.value?.versions.find((v) => v.id === versionId.value))
const hasIt = (studentId: string, vid: string) => state.data.value?.open.get(studentId)?.has(vid) ?? false
const already = computed(() => (chosen.value ? students.filter((s) => hasIt(s.id, chosen.value!.id)) : []))
const targets = computed(() => (chosen.value ? students.filter((s) => !hasIt(s.id, chosen.value!.id)) : []))
const lessonOptions = computed(() => (chosen.value?.lessons ?? []).map((l) => ({ value: l.id, label: `${l.sequence}. ${l.title}` })))
watch(chosen, () => (startLessonId.value = lessonOptions.value[0]?.value))

async function submit() {
  const v = chosen.value
  if (!v || !targets.value.length) return
  busy.value = true
  try {
    const res = await assignMany(
      targets.value.map((s) => s.id),
      v.id,
      startLessonId.value ?? null,
      gated.value ? (v.lessons.find((l) => l.id === startLessonId.value) ?? v.lessons[0])?.sequence ?? 1 : null,
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
          <BaseSelect v-if="chosen" v-model="startLessonId" label="Başlangıç dersi" :options="lessonOptions" />
          <div v-if="chosen" class="flex flex-col gap-1">
            <BaseSwitch v-model="gated" label="Dersleri ben açacağım" />
            <p class="text-ink-soft type-small">{{ gated ? 'Öğrenci yalnız başlangıç dersini açabilir; sonrakileri öğrenci profilindeki Program sekmesinden siz açarsınız.' : 'Dersler sırayla, önceki ders bitince kendiliğinden açılır.' }}</p>
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
      <BaseButton :disabled="!chosen || !targets.length" :loading="busy" @click="submit">
        {{ targets.length > 1 ? `${targets.length} öğrenciye ata` : 'Ata' }}
      </BaseButton>
    </template>
  </ResponsiveDialog>
</template>
