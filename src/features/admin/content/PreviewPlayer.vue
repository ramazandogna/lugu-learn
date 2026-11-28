<script setup lang="ts">
/* One admin test run: a fresh local session on `pkg`. Re-mount (new `key`) to start over. */
import { onMounted } from 'vue'
import { BaseAlert } from 'rei-kit'
import { LoadingScene } from '@/design'
import type { LessonPackage } from '@/domain/content'
import { friendlyMessage } from '@/lib/api/student'
import LessonPlayer from '@/features/student/lesson/LessonPlayer.vue'
import { createPreviewBackend } from '@/features/student/lesson/preview'
import { useLessonSession } from '@/features/student/lesson/useLessonSession'

const { lessonId, packageId, pkg } = defineProps<{ lessonId: string; packageId: string; pkg: LessonPackage }>()

const session = useLessonSession(
  () => lessonId,
  () => 'primary',
  createPreviewBackend(lessonId, packageId, pkg),
)
onMounted(session.load)
</script>

<template>
  <BaseAlert v-if="session.loadError.value" tone="danger">{{ friendlyMessage(session.loadError.value) }}</BaseAlert>
  <LoadingScene v-else-if="!session.loaded.value" label="Ders hazırlanıyor" />
  <LessonPlayer v-else :key="session.loaded.value.session.id" :session="session" :loaded="session.loaded.value" />
</template>
