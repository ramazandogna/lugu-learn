<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { BaseButton } from 'rei-kit'

import { EmptyScene, LoadingScene } from '@/design'
import { friendlyMessage, toApiError } from '@/lib/api/student'

import LessonPlayer from './LessonPlayer.vue'
import { useLessonSession } from './useLessonSession'

const { replay = false } = defineProps<{ replay?: boolean }>()
const route = useRoute()
const lessonId = computed(() => String(route.params.lessonId ?? ''))

const session = useLessonSession(
  () => lessonId.value,
  () => (replay ? 'replay' : 'primary'),
)

onMounted(session.load)
watch([lessonId, () => replay], () => void session.load())

const code = computed(() => (session.loadError.value ? toApiError(session.loadError.value).code : null))
const message = computed(() =>
  code.value === 'UNKNOWN' ? 'Ders içeriği açılamadı. Biraz sonra tekrar dener misin?' : friendlyMessage(session.loadError.value),
)
</script>

<template>
  <EmptyScene v-if="session.loadError.value" tone="error" title="Ders açılamadı" :description="message">
    <div class="flex flex-wrap justify-center gap-2">
      <BaseButton v-if="code === 'LUGU_USE_REPLAY'" as="router-link" :to="`/ders/${lessonId}/tekrar`">Dersi tekrar oyna</BaseButton>
      <BaseButton v-else-if="code === 'NETWORK' || code === 'UNKNOWN'" @click="session.load">Tekrar dene</BaseButton>
      <BaseButton as="router-link" to="/" variant="secondary">Ana sayfaya dön</BaseButton>
    </div>
  </EmptyScene>
  <LoadingScene v-else-if="!session.loaded.value" label="Dersin hazırlanıyor" />
  <LessonPlayer v-else :key="session.loaded.value.session.id" :session="session" :loaded="session.loaded.value" />
</template>
