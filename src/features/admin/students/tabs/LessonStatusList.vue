<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, FlaskConical, Lock, LockOpen, MoreHorizontal, Play } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseMenu, useToast } from 'rei-kit'
import { errorMessage, setOpenLessons, setProgress, type AssignmentDetail } from '@/lib/api/admin'

/* One row per lesson with its state. Aç/Kilitle saves at once (clicks are queued) and the toast can undo it. */
const { detail } = defineProps<{ detail: AssignmentDetail }>()
const emit = defineEmits<{ changed: [] }>()
const toast = useToast()

const a = computed(() => detail.assignment)
const lessons = computed(() => detail.lessons.filter((l) => l.status !== 'archived'))
const rows = computed(() =>
  lessons.value.map((l) => {
    const completed = detail.completedLessonIds.has(l.id)
    const open = a.value.open_lesson_ids === null || a.value.open_lesson_ids.includes(l.id)
    const status = completed ? 'done' : open && l.id === a.value.current_lesson_id ? 'current' : open ? 'open' : 'locked'
    return { lesson: l, completed, open, status } as const
  }),
)
const STATUS = {
  done: { label: 'Bitti', tone: 'success', icon: Check },
  current: { label: 'Şu an', tone: 'primary', icon: Play },
  open: { label: 'Açık', tone: 'neutral', icon: LockOpen },
  locked: { label: 'Kilitli', tone: 'neutral', icon: Lock },
} as const

const busy = ref(false)
let chain: Promise<unknown> = Promise.resolve()
function queue(fn: () => Promise<void>) {
  busy.value = true
  const next = chain.then(fn).catch((e) => void toast.danger(errorMessage(e), { duration: 0 }))
  chain = next
  void next.finally(() => {
    if (chain === next) busy.value = false
  })
}

function toggle(id: string, makeOpen: boolean) {
  queue(async () => {
    const prev = a.value.open_lesson_ids
    const allIds = lessons.value.map((l) => l.id)
    const base = new Set(prev ?? allIds)
    if (makeOpen) base.add(id)
    else base.delete(id)
    await setOpenLessons(a.value.id, allIds.filter((x) => base.has(x)))
    emit('changed')
    toast.success(makeOpen ? 'Ders açıldı' : 'Ders kilitlendi', {
      duration: 8000,
      action: {
        label: 'Geri al',
        onClick: () =>
          queue(async () => {
            await setOpenLessons(a.value.id, prev)
            emit('changed')
          }),
      },
    })
  })
}
function startHere(id: string) {
  queue(async () => {
    await setProgress(a.value.id, 'set_lesson', '', id)
    toast.success('Öğrenci bu dersten devam edecek')
    emit('changed')
  })
}
const linkClass = 'focus-ring rounded-control text-ink-soft hover:text-ink hover:bg-muted type-small inline-flex min-h-10 items-center gap-1 px-2'
</script>

<template>
  <ul class="divide-hair divide-y" aria-label="Dersler">
    <li v-for="r in rows" :key="r.lesson.id" class="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1">
      <div class="flex min-w-0 items-center gap-2">
        <span class="type-body" :class="r.status === 'locked' ? 'text-ink-soft' : ''">{{ r.lesson.sequence }}. {{ r.lesson.title }}</span>
        <BaseBadge :tone="STATUS[r.status].tone">
          <component :is="STATUS[r.status].icon" :size="14" aria-hidden="true" /> {{ STATUS[r.status].label }}
        </BaseBadge>
      </div>
      <div class="flex shrink-0 flex-wrap items-center gap-1">
        <RouterLink :class="linkClass" :to="{ name: 'admin-lesson-preview', params: { lessonId: r.lesson.id } }"><FlaskConical :size="16" aria-hidden="true" /> Dersi dene</RouterLink>
        <BaseButton v-if="!r.open && !r.completed" size="sm" variant="secondary" :disabled="busy" @click="toggle(r.lesson.id, true)">Aç</BaseButton>
        <BaseButton v-else-if="r.open && !r.completed" size="sm" variant="secondary" :disabled="busy" @click="toggle(r.lesson.id, false)">Kilitle</BaseButton>
        <BaseMenu :label="`${r.lesson.title} işlemleri`" align="end">
          <template #trigger>
            <BaseButton size="sm" variant="secondary" :aria-label="`${r.lesson.title} işlemleri`"><MoreHorizontal :size="16" aria-hidden="true" /></BaseButton>
          </template>
          <BaseButton variant="row" role="menuitem" :disabled="busy" @click="startHere(r.lesson.id)">Buradan başlat</BaseButton>
          <RouterLink role="menuitem" :class="linkClass" :to="{ name: 'admin-lesson', params: { lessonId: r.lesson.id }, query: { sekme: 'speaking' } }">Konuşma planı</RouterLink>
        </BaseMenu>
      </div>
    </li>
  </ul>
</template>
