<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BaseBadge, BaseButton } from 'rei-kit'
import EmptyState from '../components/AdminEmpty.vue'
import type { LessonRow } from './data'

defineProps<{ rows: readonly LessonRow[] }>()
</script>

<template>
  <EmptyState v-if="!rows.length" title="Bu müfredatta henüz ders yok" />
  <ol v-else class="flex flex-col gap-2" aria-label="Dersler, sırasıyla">
    <li v-for="(r, i) in rows" :key="r.lesson.id" class="surface rounded-card flex flex-wrap items-center gap-3 p-3">
      <div class="min-w-48 flex-1">
        <RouterLink :to="{ name: 'admin-lesson', params: { lessonId: r.lesson.id } }" class="focus-ring rounded-cell font-semibold hover:underline">
          {{ i + 1 }}. {{ r.lesson.title }}
        </RouterLink>
        <p class="text-ink-soft type-small">{{ r.lesson.estimated_minutes }} dk</p>
      </div>
      <BaseBadge :tone="r.published ? 'success' : 'neutral'">{{ r.published ? 'Yayında' : 'Taslak' }}</BaseBadge>
      <BaseButton as="router-link" size="sm" variant="secondary" :to="{ name: 'admin-lesson-preview', params: { lessonId: r.lesson.id } }">Dersi dene</BaseButton>
    </li>
  </ol>
</template>
