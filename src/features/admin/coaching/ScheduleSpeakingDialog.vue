<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseDatePicker, BaseSelect, TimePicker, todayKey } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { scheduleSpeaking, type StudentSummary } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'
import { speakingLessonOptions, type SpeakingLessonOption } from './lesson-options'

const open = defineModel<boolean>({ default: false })
const { students, fixedStudentId } = defineProps<{ students: readonly StudentSummary[]; fixedStudentId?: string }>()
const emit = defineEmits<{ scheduled: [] }>()
const router = useRouter()

const studentId = ref<string | undefined>()
const date = ref<string | undefined>()
const time = ref<string | undefined>('16:00')
const { busy, run } = useAction()
const lessonId = ref<string | undefined>()
const lessonOptions = ref<SpeakingLessonOption[]>([])
watch(
  () => (open.value ? studentId.value : undefined),
  async (id) => {
    lessonOptions.value = []
    lessonId.value = undefined
    if (!id) return
    try {
      const r = await speakingLessonOptions(id)
      if (studentId.value !== id) return
      lessonOptions.value = r.options
      lessonId.value = r.current ?? r.options[0]?.value
    } catch {
      /* no lesson list: the session can still be planned without a lesson */
    }
  },
)
function now() {
  const d = new Date()
  date.value = todayKey()
  time.value = `${String(d.getHours()).padStart(2, '0')}:${String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, '0')}`
}

watch(open, (v) => {
  if (!v) return
  studentId.value = fixedStudentId
  date.value = todayKey()
  time.value = '16:00'
})

const options = computed(() => students.filter((s) => s.status === 'active').map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })))

async function submit() {
  if (!studentId.value || !date.value || !time.value) return
  const [y, m, d] = date.value.split('-').map(Number)
  const [hh, mm] = time.value.split(':').map(Number)
  const at = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0).toISOString()
  const sid = studentId.value
  await run(async () => {
    const created = await scheduleSpeaking(sid, at, lessonId.value ?? null)
    open.value = false
    emit('scheduled')
    await router.push({ name: 'admin-speaking-session', params: { sessionId: created.id } })
  }, 'Konuşma oturumu planlandı')
}
</script>

<template>
  <ResponsiveDialog v-model="open" title="Konuşma oturumu planla" close-label="Kapat">
    <form id="schedule-speaking" class="grid gap-4" @submit.prevent="submit">
      <BaseSelect v-if="!fixedStudentId" v-model="studentId" label="Öğrenci" placeholder="Seçin" :options="options" />
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseDatePicker v-model="date" label="Tarih" previous-label="Önceki ay" next-label="Sonraki ay" :week-starts-on="1" />
        <TimePicker v-model="time" label="Saat" hours-label="Saat" minutes-label="Dakika" :step="15" />
      </div>
      <BaseButton class="w-fit" size="sm" variant="secondary" @click="now">Şimdi başlıyoruz</BaseButton>
      <BaseSelect
        v-if="studentId"
        v-model="lessonId"
        label="Hangi dersi konuşacağız?"
        :placeholder="lessonOptions.length ? 'Ders seçin' : 'Öğrencinin programı yok'"
        :options="lessonOptions"
        :disabled="!lessonOptions.length"
        hint="Oturum sayfasında bu dersin 1 saatlik planı ve hedefleri açılır."
      />
    </form>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton type="submit" form="schedule-speaking" :disabled="!studentId || !date || !time" :loading="busy">Planla</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
