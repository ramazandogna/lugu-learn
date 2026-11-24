<script setup lang="ts">
import { BaseBadge, BaseButton } from 'rei-kit'
import { CloudOff, Check, LoaderCircle, Repeat } from 'lucide-vue-next'

import type { QueueStatus } from '@/lib/api/student'

import type { StudentPackage } from '../package'

/* Lesson title, replay label and the save state ("kaydediliyor"), always in words as well as an icon. */
const { pkg, replay, saving } = defineProps<{ pkg: StudentPackage; replay: boolean; saving: QueueStatus }>()
</script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
    <div class="min-w-0">
      <p class="type-eyebrow text-ink-soft">{{ pkg.meta.theme }}</p>
      <h1 class="type-title text-ink" lang="en">{{ pkg.meta.title }}</h1>
      <p class="text-ink-soft type-small max-sm:hidden">{{ pkg.meta.tagline }}</p>
      <BaseBadge v-if="replay" class="mt-2">
        <Repeat :size="16" aria-hidden="true" /> Tekrar modu · İlk sonuçların değişmez
      </BaseBadge>
    </div>
    <div class="flex items-center gap-2">
      <p class="text-ink-soft flex items-center gap-1 type-small" role="status">
        <template v-if="saving === 'saving'"><LoaderCircle :size="16" class="motion-safe:animate-spin" aria-hidden="true" /> Kaydediliyor…</template>
        <template v-else-if="saving === 'offline'"><CloudOff :size="16" class="text-warning-ink" aria-hidden="true" /> Bağlantı bekleniyor, cevapların güvende</template>
        <template v-else><Check :size="16" class="text-positive" aria-hidden="true" /> Kaydedildi</template>
      </p>
      <BaseButton as="router-link" to="/" variant="quiet">Dersten çık</BaseButton>
    </div>
  </header>
</template>
