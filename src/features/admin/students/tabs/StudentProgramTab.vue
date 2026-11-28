<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton } from 'rei-kit'
import { BaseDisclosure } from 'rei-kit/web'
import { getStudent, listAssignments } from '@/lib/api/admin'
import LoadState from '../../components/LoadState.vue'
import { useLoad } from '../../lib/use-load'
import AssignProgramDialog from '../AssignProgramDialog.vue'
import AssignmentCard from './AssignmentCard.vue'
import EmptyState from '../../components/AdminEmpty.vue'

const { studentId } = defineProps<{ studentId: string }>()
const emit = defineEmits<{ changed: [] }>()

const state = useLoad(async () => {
  const [assignments, student] = await Promise.all([listAssignments(studentId), getStudent(studentId)])
  return { assignments, name: student?.name ?? 'Öğrenci' }
})
const assigning = ref(false)

const active = computed(() => (state.data.value?.assignments ?? []).filter((a) => a.assignment.status === 'active' || a.assignment.status === 'paused'))
const past = computed(() => (state.data.value?.assignments ?? []).filter((a) => a.assignment.status !== 'active' && a.assignment.status !== 'paused'))

async function changed() {
  await state.reload()
  emit('changed')
}
</script>

<template>
  <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
    <div v-if="state.data.value" class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="type-body font-semibold">Aktif programlar</h2>
        <BaseButton @click="assigning = true">Program ata</BaseButton>
      </div>
      <EmptyState v-if="!active.length" title="Açık program yok" description="Program ata düğmesiyle yayınlanmış bir müfredat seçin." />
      <AssignmentCard v-for="a in active" :key="a.assignment.id" :detail="a" @changed="changed" />
      <BaseDisclosure v-if="past.length" :title="`Geçmiş programlar (${past.length})`" :heading-level="2">
        <div class="flex flex-col gap-3">
          <AssignmentCard v-for="a in past" :key="a.assignment.id" :detail="a" @changed="changed" />
        </div>
      </BaseDisclosure>
    </div>
    <AssignProgramDialog v-if="state.data.value && assigning" v-model="assigning" :students="[{ id: studentId, name: state.data.value.name }]" @assigned="changed" />
  </LoadState>
</template>
