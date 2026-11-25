<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseCheckbox, BaseInput, BaseSelect, useToast } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { assignMany, errorMessage, listPublishedVersions, listStudents, openVersionsByStudent } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'

/* Reverse direction: one published version, many students. */
const open = defineModel<boolean>({ default: false })
const { versionId } = defineProps<{ versionId: string }>()
const emit = defineEmits<{ assigned: [] }>()

const router = useRouter()
const toast = useToast()
const state = useLoad(async () => {
  const [students, open, versions] = await Promise.all([listStudents(), openVersionsByStudent(), listPublishedVersions()])
  return { students, open, version: versions.find((v) => v.id === versionId) }
})
const q = ref('')
const picked = ref(new Set<string>())
const startLessonId = ref<string | undefined>()
const busy = ref(false)

watch(open, (v) => {
  if (!v) return
  q.value = ''
  picked.value = new Set()
  void state.reload()
})

const has = (id: string) => state.data.value?.open.get(id)?.has(versionId) ?? false
const list = computed(() => {
  const needle = q.value.trim().toLocaleLowerCase('tr')
  return (state.data.value?.students ?? []).filter((s) => s.status !== 'disabled' && (!needle || `${s.name} ${s.code}`.toLocaleLowerCase('tr').includes(needle)))
})
const selectable = computed(() => list.value.filter((s) => !has(s.id)))
const lessonOptions = computed(() => (state.data.value?.version?.lessons ?? []).map((l) => ({ value: l.id, label: `${l.sequence}. ${l.title}` })))
watch(lessonOptions, (o) => (startLessonId.value = o[0]?.value))

function toggle(id: string, on: boolean) {
  const next = new Set(picked.value)
  if (on) next.add(id)
  else next.delete(id)
  picked.value = next
}
const allOn = computed(() => selectable.value.length > 0 && selectable.value.every((s) => picked.value.has(s.id)))
function toggleAll(on: boolean) {
  const next = new Set(picked.value)
  for (const s of selectable.value) {
    if (on) next.add(s.id)
    else next.delete(s.id)
  }
  picked.value = next
}

async function submit() {
  const ids = [...picked.value]
  if (!ids.length) return
  busy.value = true
  try {
    const res = await assignMany(ids, versionId, startLessonId.value ?? null)
    const name = (id: string) => state.data.value?.students.find((s) => s.id === id)?.name ?? id
    if (res.ok.length) {
      const only = res.ok.length === 1 ? res.ok[0] : undefined
      toast.success(only ? `${name(only)} için program atandı` : `Program ${res.ok.length} öğrenciye atandı`, {
        duration: 8000,
        action: only
          ? { label: 'Programı aç', onClick: () => void router.push({ name: 'admin-student', params: { studentId: only }, query: { sekme: 'program' } }) }
          : undefined,
      })
      emit('assigned')
    }
    for (const f of res.failed.slice(0, 3)) toast.danger(`${name(f.studentId)}: ${errorMessage(f.error)}`, { duration: 0 })
    if (!res.failed.length) open.value = false
    else void state.reload()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <ResponsiveDialog v-model="open" title="Öğrencilere ata" close-label="Kapat">
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <div v-if="state.data.value" class="flex flex-col gap-4">
        <BaseInput v-model="q" type="search" label="Öğrenci ara" placeholder="Ad veya kod" />
        <BaseSelect v-model="startLessonId" label="Başlangıç dersi" :options="lessonOptions" />
        <BaseCheckbox :model-value="allOn" :disabled="!selectable.length" :label="`Görünenlerin hepsini seç (${selectable.length})`" @update:model-value="(v: boolean) => toggleAll(v)" />
        <ul class="divide-hair flex max-h-72 flex-col divide-y overflow-y-auto" aria-label="Öğrenciler">
          <li v-for="s in list" :key="s.id" class="flex min-h-11 items-center justify-between gap-3 py-1">
            <BaseCheckbox :model-value="picked.has(s.id)" :disabled="has(s.id)" :label="`${s.name} · ${s.code}`" @update:model-value="(v: boolean) => toggle(s.id, v)" />
            <span v-if="has(s.id)" class="text-ink-soft type-small shrink-0">Zaten atanmış</span>
          </li>
          <li v-if="!list.length" class="text-ink-soft type-small py-2">Eşleşen öğrenci yok.</li>
        </ul>
      </div>
    </LoadState>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton :disabled="!picked.size" :loading="busy" @click="submit">{{ picked.size ? `${picked.size} öğrenciye ata` : 'Ata' }}</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
