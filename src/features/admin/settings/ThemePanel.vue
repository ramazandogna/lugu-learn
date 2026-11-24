<script setup lang="ts">
import { BaseCard, SegmentedControl, useTheme } from 'rei-kit'

const theme = useTheme()
</script>

<template>
  <BaseCard as="section" aria-labelledby="theme-title">
    <template #head>
      <h2 id="theme-title" class="type-body font-semibold">Tema</h2>
      <p class="text-ink-soft type-small">Bu tarayıcıda yönetim paneli için geçerlidir.</p>
    </template>
    <SegmentedControl
      v-model="theme"
      aria-label="Tema"
      :options="[
        { value: 'system', label: 'Sistem' },
        { value: 'light', label: 'Açık' },
        { value: 'dark', label: 'Koyu' },
      ]"
    />
  </BaseCard>
</template>
