<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BaseCard, EmptyState } from 'rei-kit'
import type { StudentSummary } from '@/lib/api/admin'
import type { AttentionReason } from '../lib/attention'

defineProps<{ items: readonly { student: StudentSummary; reasons: AttentionReason[] }[] }>()
</script>

<template>
  <BaseCard as="section" aria-labelledby="dash-attention">
    <template #head>
      <h2 id="dash-attention" class="text-base font-semibold">İlgi bekleyen öğrenciler</h2>
      <p class="text-ink-soft text-sm">Son 30 günün verilerinden çıkan gözlemler; yargı değil, bakılacak yer.</p>
    </template>
    <EmptyState v-if="!items.length" title="Şu an dikkat gerektiren bir durum görünmüyor" />
    <ul v-else class="divide-hair divide-y">
      <li v-for="item in items" :key="item.student.id" class="py-3">
        <RouterLink :to="{ name: 'admin-student', params: { studentId: item.student.id } }" class="focus-ring rounded-control font-semibold hover:underline">
          {{ item.student.name }}
          <span class="text-ink-soft text-sm font-normal">· {{ item.student.code }}</span>
        </RouterLink>
        <ul class="text-ink-soft mt-1 list-disc ps-5 text-sm">
          <li v-for="r in item.reasons" :key="r.kind">{{ r.text }}</li>
        </ul>
      </li>
    </ul>
  </BaseCard>
</template>
