<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { BaseCheckbox, useToast } from 'rei-kit'
import { friendlyMessage, getTasks, setTaskStatus } from '@/lib/api/student'
import type { StudentTask } from '@/lib/database.types'

/* Küçük "Görevlerim" listesi. Yüklenemezse sessizce yok olur; ana sayfa bundan etkilenmez. */
const tasks = shallowRef<StudentTask[]>([])
const busyId = shallowRef<string | null>(null)
const toast = useToast()
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' })

onMounted(async () => {
  try {
    tasks.value = await getTasks()
  } catch {
    tasks.value = []
  }
})

const open = computed(() => tasks.value.filter((t) => t.status !== 'done'))
const doneCount = computed(() => tasks.value.length - open.value.length)
const late = (t: StudentTask) => t.due_date !== null && t.due_date < today
const due = (t: StudentTask) => (t.due_date ? dateFmt.format(new Date(`${t.due_date}T12:00:00`)) : null)

async function toggle(t: StudentTask, checked: boolean) {
  busyId.value = t.id
  try {
    await setTaskStatus(t.id, checked ? 'done' : 'open')
    tasks.value = tasks.value.map((x) => (x.id === t.id ? { ...x, status: checked ? 'done' : 'open' } : x))
  } catch (e) {
    toast.danger(friendlyMessage(e))
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <section v-if="tasks.length" aria-labelledby="tasks-title" class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6">
    <div class="flex items-baseline justify-between gap-2">
      <h2 id="tasks-title" class="type-section text-ink">Görevlerim</h2>
      <p class="type-small text-ink-soft">{{ doneCount }} / {{ tasks.length }} tamamlandı</p>
    </div>
    <ul class="flex flex-col gap-2">
      <li v-for="t in tasks" :key="t.id" class="flex flex-col gap-1">
        <BaseCheckbox :model-value="t.status === 'done'" :label="t.title" :disabled="busyId === t.id" @update:model-value="(v: boolean) => toggle(t, v)" />
        <p class="type-small text-ink-soft ps-8">
          <span v-if="t.subject">{{ t.subject }}</span>
          <span v-if="t.subject && (t.lesson || due(t))"> · </span>
          <span v-if="t.lesson">{{ t.lesson }}</span>
          <span v-if="t.lesson && due(t)"> · </span>
          <span v-if="due(t)" :class="t.status !== 'done' && late(t) ? 'text-negative font-semibold' : ''">
            Son gün: {{ due(t) }}{{ t.status !== 'done' && late(t) ? ' (geçti)' : '' }}
          </span>
        </p>
        <p v-if="t.description" class="type-small text-ink-soft ps-8">{{ t.description }}</p>
      </li>
    </ul>
  </section>
</template>
