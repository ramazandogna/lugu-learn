<script setup lang="ts">
import { computed, ref } from 'vue'
import { getStudent, listAssignments } from '@/lib/api/admin'
import LoadState from '../../components/LoadState.vue'
import EmptyState from '../../components/AdminEmpty.vue'
import { useLoad } from '../../lib/use-load'
import AssignProgramDialog from '../AssignProgramDialog.vue'
import AssignmentCard from './AssignmentCard.vue'
import ProgramStrip from './ProgramStrip.vue'

const { studentId } = defineProps<{ studentId: string }>()
const emit = defineEmits<{ changed: [] }>()

const state = useLoad(async () => {
  const [assignments, student] = await Promise.all([listAssignments(studentId), getStudent(studentId)])
  return { assignments, name: student?.name ?? 'Öğrenci' }
})
const assigning = ref(false)
const pickedId = ref<string>()
const showPast = ref(false)

const isOpen = (s: string) => s === 'active' || s === 'paused'
const active = computed(() => (state.data.value?.assignments ?? []).filter((a) => isOpen(a.assignment.status)))
const past = computed(() => (state.data.value?.assignments ?? []).filter((a) => !isOpen(a.assignment.status)))
const selected = computed(() => active.value.find((a) => a.assignment.id === pickedId.value) ?? active.value[0])

async function changed() {
  await state.reload()
  emit('changed')
}
</script>

<template>
  <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
    <div v-if="state.data.value" class="flex flex-col gap-4">
      <ProgramStrip :items="active" :selected="selected?.assignment.id" @select="pickedId = $event" @assign="assigning = true" />
      <EmptyState v-if="!selected" title="Açık program yok" description="Program ata ile yayınlanmış bir müfredat seçin." />
      <AssignmentCard v-else :key="selected.assignment.id" :detail="selected" @changed="changed" />
      <div v-if="past.length">
        <button type="button" class="focus-ring text-ink-soft hover:text-ink type-small min-h-10 underline" :aria-expanded="showPast" @click="showPast = !showPast">
          Geçmiş programlar ({{ past.length }})
        </button>
        <ul v-if="showPast" class="type-small text-ink-soft mt-1 flex flex-col gap-1">
          <li v-for="p in past" :key="p.assignment.id">{{ p.curriculumName }} · sürüm {{ p.version }}</li>
        </ul>
      </div>
    </div>
    <AssignProgramDialog v-if="state.data.value && assigning" v-model="assigning" :students="[{ id: studentId, name: state.data.value.name }]" @assigned="changed" />
  </LoadState>
</template>
