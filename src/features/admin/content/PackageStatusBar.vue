<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseBadge, BaseButton } from 'rei-kit'
import { BaseToolbar } from 'rei-kit/web'
import { setPackageStatus, type PackageRow } from '@/lib/api/admin'
import type { PackageStatus } from '@/lib/database.types'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { PACKAGE_STATUS, PACKAGE_TONE } from '../lib/format'
import { NEXT_STATUS, validatePackage } from '../lib/package-edit'
import { useAction } from '../lib/use-load'

const { pkg } = defineProps<{ pkg: PackageRow }>()
const emit = defineEmits<{ changed: [row: PackageRow] }>()
const { busy, run } = useAction()

const FLOW: PackageStatus[] = ['draft', 'ai_generated', 'qa', 'review', 'approved', 'published']
const NEXT_LABEL: Partial<Record<PackageStatus, string>> = {
  qa: 'Kalite kontrole gönder',
  review: 'İncelemeye al',
  approved: 'Onayla',
  published: 'Yayınla',
}
const next = computed(() => NEXT_STATUS[pkg.status])
const frozen = computed(() => pkg.published_at !== null && (pkg.status === 'published' || pkg.status === 'archived'))
const valid = computed(() => validatePackage(pkg.content as unknown).ok)
const canRevoke = computed(() => ['ai_generated', 'qa', 'review', 'approved'].includes(pkg.status))

const pending = ref<PackageStatus | null>(null)
const confirmOpen = ref(false)
const MESSAGES: Partial<Record<PackageStatus, string>> = {
  published: 'Bu revizyon öğrencilere açılır; şu anda yayında olan revizyon arşivlenir. Yayınlanan içerik değiştirilemez.',
  archived: 'Revizyon arşivlenir. Yayınlanmış bir revizyon arşivlenirse ders, yeni bir revizyon yayınlanana kadar öğrencilere içeriksiz kalır.',
  draft: 'Revizyon taslağa geri çekilir ve yeniden düzenlenebilir.',
}

function ask(status: PackageStatus) {
  if (MESSAGES[status]) {
    pending.value = status
    confirmOpen.value = true
  } else void apply(status)
}

async function apply(status: PackageStatus) {
  let row: PackageRow | null = null
  const ok = await run(async () => (row = await setPackageStatus(pkg.id, status)), `Durum: ${PACKAGE_STATUS[status]}`)
  confirmOpen.value = false
  if (ok && row) emit('changed', row)
}
</script>

<template>
  <div class="surface rounded-card flex flex-col gap-3 p-4">
    <ol class="flex flex-wrap items-center gap-1 type-small" aria-label="İçerik onay akışı">
      <li v-for="(s, i) in FLOW" :key="s" class="flex items-center gap-1">
        <BaseBadge :tone="s === pkg.status ? PACKAGE_TONE[s] : 'neutral'" :aria-current="s === pkg.status ? 'step' : undefined">
          {{ PACKAGE_STATUS[s] }}<span v-if="s === pkg.status" class="sr-only"> (şu anki durum)</span>
        </BaseBadge>
        <span v-if="i < FLOW.length - 1" class="text-ink-soft" aria-hidden="true">›</span>
      </li>
      <li v-if="pkg.status === 'archived'"><BaseBadge tone="neutral" aria-current="step">Arşiv (şu anki durum)</BaseBadge></li>
    </ol>
    <BaseToolbar v-if="!frozen || pkg.status === 'published'" label="Durum işlemleri" class="flex flex-wrap gap-2">
      <BaseButton v-if="next" size="sm" :loading="busy" :disabled="next === 'published' && !valid" @click="ask(next)">{{ NEXT_LABEL[next] }}</BaseButton>
      <BaseButton v-if="canRevoke" size="sm" variant="secondary" @click="ask('draft')">Taslağa geri çek</BaseButton>
      <BaseButton v-if="pkg.status !== 'archived'" size="sm" variant="quiet" @click="ask('archived')">Arşivle</BaseButton>
    </BaseToolbar>
    <p v-if="next === 'published' && !valid" class="text-ink-soft type-small">Paket doğrulanmadan yayınlanamaz; düzenleyicide kaydedip sorunları görün.</p>
    <p v-if="frozen && pkg.status === 'archived'" class="text-ink-soft type-small">Bir kez yayınlanmış bu revizyon kalıcı olarak dondurulmuştur.</p>
    <ConfirmDialog
      v-if="pending"
      v-model="confirmOpen"
      :title="`${PACKAGE_STATUS[pending]} durumuna geçilsin mi?`"
      :message="MESSAGES[pending] ?? ''"
      :confirm-label="pending === 'published' ? 'Yayınla' : pending === 'archived' ? 'Arşivle' : 'Geri çek'"
      :tone="pending === 'archived' ? 'danger' : 'primary'"
      :busy="busy"
      @confirm="apply(pending)"
    />
  </div>
</template>
