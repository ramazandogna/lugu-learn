<script setup lang="ts">
import { BaseAlert, BaseButton, EmptyState, SkeletonList } from 'rei-kit'

const {
  loading,
  error,
  empty = false,
  emptyTitle = 'Henüz kayıt yok',
  emptyDescription,
  rows = 4,
} = defineProps<{
  loading: boolean
  error: string | null
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  rows?: number
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <SkeletonList v-if="loading" :rows="rows" label="Yükleniyor" />
  <BaseAlert v-else-if="error" tone="danger">
    <template #title>Veriler yüklenemedi</template>
    {{ error }}
    <template #action>
      <BaseButton variant="secondary" @click="emit('retry')">Tekrar dene</BaseButton>
    </template>
  </BaseAlert>
  <EmptyState v-else-if="empty" :title="emptyTitle" :description="emptyDescription">
    <template v-if="$slots.emptyAction" #action><slot name="emptyAction" /></template>
  </EmptyState>
  <slot v-else />
</template>
