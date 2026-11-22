<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseButton, BaseCard, BaseSelect, EmptyState } from 'rei-kit'
import { assignProgram, listAssignments, listPublishedVersions } from '@/lib/api/admin'
import LoadState from '../../components/LoadState.vue'
import { useAction, useLoad } from '../../lib/use-load'
import AssignmentCard from './AssignmentCard.vue'

const { studentId } = defineProps<{ studentId: string }>()
const emit = defineEmits<{ changed: [] }>()

const state = useLoad(async () => {
  const [assignments, versions] = await Promise.all([listAssignments(studentId), listPublishedVersions()])
  return { assignments, versions }
})

const versionId = ref<string | undefined>()
const startLessonId = ref<string | undefined>()
const { busy, run } = useAction()

const versionOptions = computed(() =>
  (state.data.value?.versions ?? []).map((v) => ({ value: v.id, label: `${v.curriculumName} · sürüm ${v.version} (${v.lessons.length} ders)` })),
)
const lessonOptions = computed(() =>
  (state.data.value?.versions.find((v) => v.id === versionId.value)?.lessons ?? []).map((l) => ({ value: l.id, label: `${l.sequence}. ${l.title}` })),
)
watch(versionId, () => (startLessonId.value = lessonOptions.value[0]?.value))

async function assign() {
  if (!versionId.value) return
  const ok = await run(() => assignProgram(studentId, versionId.value as string, startLessonId.value ?? null), 'Program atandı')
  if (ok) {
    versionId.value = undefined
    await state.reload()
    emit('changed')
  }
}

async function changed() {
  await state.reload()
  emit('changed')
}
</script>

<template>
  <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
    <div v-if="state.data.value" class="flex flex-col gap-4">
      <BaseCard as="section" aria-labelledby="assign-title">
        <template #head><h2 id="assign-title" class="text-base font-semibold">Program ata</h2></template>
        <EmptyState
          v-if="!versionOptions.length"
          title="Yayınlanmış müfredat sürümü yok"
          description="Atama yapabilmek için Müfredatlar bölümünde bir sürümü yayınlayın."
        />
        <form v-else class="grid items-end gap-3 md:grid-cols-[2fr_2fr_auto]" @submit.prevent="assign">
          <BaseSelect v-model="versionId" label="Müfredat sürümü" placeholder="Seçin" :options="versionOptions" />
          <BaseSelect v-model="startLessonId" label="Başlangıç dersi" placeholder="İlk ders" :options="lessonOptions" />
          <BaseButton type="submit" :disabled="!versionId" :loading="busy">Ata</BaseButton>
        </form>
      </BaseCard>

      <EmptyState v-if="!state.data.value.assignments.length" title="Öğrenciye henüz program atanmadı" />
      <AssignmentCard v-for="a in state.data.value.assignments" :key="a.assignment.id" :detail="a" @changed="changed" />
    </div>
  </LoadState>
</template>
