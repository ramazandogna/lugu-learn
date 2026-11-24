<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BaseButton, BaseCard, BasePopconfirm } from 'rei-kit'
import { updateSpeakingSession, type SpeakingSession } from '@/lib/api/admin'
import { formatDateTime, formatDuration } from '../lib/format'
import { useAction } from '../lib/use-load'

const { session } = defineProps<{ session: SpeakingSession }>()
const emit = defineEmits<{ changed: [] }>()
const { busy, run } = useAction()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
watch(
  () => session.status,
  (s) => {
    if (timer) clearInterval(timer)
    timer = s === 'started' ? setInterval(() => (now.value = Date.now()), 1000) : undefined
  },
  { immediate: true },
)
onBeforeUnmount(() => timer && clearInterval(timer))

const elapsed = computed(() => {
  if (!session.started_at) return null
  const end = session.ended_at ? Date.parse(session.ended_at) : now.value
  return (end - Date.parse(session.started_at)) / 1000
})

const PLANNED_MINUTES = 60

async function change(patch: Parameters<typeof updateSpeakingSession>[1], message: string) {
  if (await run(() => updateSpeakingSession(session.id, patch), message)) emit('changed')
}
const start = () => change({ status: 'started', started_at: new Date().toISOString(), ended_at: null }, 'Oturum başladı')
const end = () => change({ status: 'ended', ended_at: new Date().toISOString() }, 'Oturum bitti')
const cancel = () => change({ status: 'cancelled' }, 'Oturum iptal edildi')
</script>

<template>
  <BaseCard as="section" aria-labelledby="sp-timer">
    <template #head><h2 id="sp-timer" class="type-body font-semibold">Oturum süresi</h2></template>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="type-title font-semibold tabular-nums" :aria-live="session.status === 'started' ? 'off' : 'polite'">
          {{ elapsed === null ? '0 sn' : formatDuration(elapsed) }}
        </p>
        <p class="text-ink-soft type-small">
          <template v-if="session.started_at">Başlangıç {{ formatDateTime(session.started_at) }}</template>
          <template v-if="session.ended_at"> · bitiş {{ formatDateTime(session.ended_at) }}</template>
          <template v-if="session.status === 'started' && elapsed !== null && elapsed > PLANNED_MINUTES * 60"> · planlanan {{ PLANNED_MINUTES }} dakika aşıldı</template>
          <template v-if="session.status === 'cancelled'">İptal edildi</template>
        </p>
      </div>
      <div class="flex gap-2">
        <BaseButton v-if="session.status === 'planned'" :loading="busy" @click="start">Başlat</BaseButton>
        <BaseButton v-if="session.status === 'started'" :loading="busy" @click="end">Bitir</BaseButton>
        <BaseButton v-if="session.status === 'ended'" variant="secondary" :loading="busy" @click="start">Yeniden başlat</BaseButton>
        <BasePopconfirm
          v-if="session.status === 'planned'"
          message="Oturum iptal edilsin mi?"
          confirm-label="İptal et"
          cancel-label="Vazgeç"
          tone="danger"
          @confirm="cancel"
        >
          <template #trigger="{ props }"><BaseButton variant="secondary" v-bind="props">İptal et</BaseButton></template>
        </BasePopconfirm>
      </div>
    </div>
  </BaseCard>
</template>
