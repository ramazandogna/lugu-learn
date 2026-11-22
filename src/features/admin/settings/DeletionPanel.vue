<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseAlert, BaseBadge, BaseButton, BaseInput, BasePopconfirm } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { listDeletionRequests, processDeletion, rejectDeletionRequest, type DeletionRequest } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { formatDateTime } from '../lib/format'
import { useAction, useLoad } from '../lib/use-load'

const state = useLoad(listDeletionRequests)
const { busy, run } = useAction()
const target = ref<DeletionRequest | null>(null)
const open = ref(false)
const typed = ref('')

const STATUS: Record<DeletionRequest['status'], { label: string; tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  requested: { label: 'Bekliyor', tone: 'warning' },
  approved: { label: 'Onaylandı', tone: 'primary' },
  rejected: { label: 'Reddedildi', tone: 'neutral' },
  completed: { label: 'Silindi', tone: 'success' },
  failed: { label: 'Başarısız', tone: 'danger' },
}
const matches = computed(() => target.value !== null && typed.value.trim().toUpperCase() === (target.value.student_code ?? '').toUpperCase())

function approve(r: DeletionRequest) {
  target.value = r
  typed.value = ''
  open.value = true
}

async function confirm() {
  const r = target.value
  if (!r || !matches.value) return
  await run(() => processDeletion(r.id, typed.value.trim()), 'Öğrencinin tüm verileri silindi')
  open.value = false
  // Reload either way: a failed run is recorded on the request (`failed` + error).
  await state.reload()
}

async function reject(id: string) {
  if (await run(() => rejectDeletionRequest(id), 'Talep reddedildi')) await state.reload()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-ink-soft max-w-(--measure-reading) text-sm">
      Silme talebi öğrenci profilinden oluşturulur. Onaylandığında öğrencinin hesabı ve tüm öğrenme, akademik ve koçluk kayıtları kalıcı olarak silinir.
    </p>
    <LoadState :loading="state.loading.value" :error="state.error.value" :empty="!state.data.value?.length" empty-title="Silme talebi yok" @retry="state.reload">
      <ul class="divide-hair surface rounded-card divide-y px-4">
        <li v-for="r in state.data.value ?? []" :key="r.id" class="flex flex-wrap items-center gap-3 py-3">
          <div class="min-w-60 flex-1">
            <p class="font-semibold">{{ r.student_code ?? 'Kod yok' }}</p>
            <p class="text-ink-soft text-sm">
              {{ formatDateTime(r.created_at) }}<template v-if="r.reason"> · {{ r.reason }}</template>
              <template v-if="r.processed_at"> · işlendi {{ formatDateTime(r.processed_at) }}</template>
            </p>
            <p v-if="r.error" class="text-sm">Hata: {{ r.error }}</p>
          </div>
          <BaseBadge :tone="STATUS[r.status].tone">{{ STATUS[r.status].label }}</BaseBadge>
          <template v-if="r.status === 'requested' || r.status === 'approved' || r.status === 'failed'">
            <BaseButton size="sm" variant="danger" :disabled="!r.student_code" @click="approve(r)">Onayla ve sil</BaseButton>
            <BasePopconfirm v-if="r.status === 'requested'" message="Talep reddedilsin mi?" confirm-label="Reddet" cancel-label="Vazgeç" @confirm="reject(r.id)">
              <template #trigger="{ props }"><BaseButton size="sm" variant="quiet" v-bind="props">Reddet</BaseButton></template>
            </BasePopconfirm>
          </template>
        </li>
      </ul>
    </LoadState>
    <ResponsiveDialog v-model="open" title="Verileri kalıcı olarak sil" close-label="Kapat" tone="alert">
      <div class="flex flex-col gap-4">
        <BaseAlert tone="danger">Bu işlem geri alınamaz. Hesap, ilerleme, yanıtlar, sınav sonuçları ve koçluk notları silinir.</BaseAlert>
        <BaseInput v-model="typed" :label="`Onaylamak için öğrenci kodunu yazın: ${target?.student_code ?? ''}`" autocomplete="off" />
      </div>
      <template #actions>
        <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
        <BaseButton variant="danger" :disabled="!matches" :loading="busy" @click="confirm">Kalıcı olarak sil</BaseButton>
      </template>
    </ResponsiveDialog>
  </div>
</template>
