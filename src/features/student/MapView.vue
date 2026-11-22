<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseButton } from 'rei-kit'

import { CharacterBubble, EmptyScene, LearningMap, LoadingScene, WorldBackground } from '@/design'
import { CHARACTER_KEYS, type CharacterKey } from '@/domain/content'
import { friendlyMessage, getLearningMap } from '@/lib/api/student'
import type { StudentLearningMap } from '@/lib/database.types'

import { lessonRoute, lockedReason, toMapNodes } from './map'

const router = useRouter()
const route = useRoute()

const map = shallowRef<StudentLearningMap | null>(null)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)

const id = computed(() => String(route.params.assignmentId ?? ''))

async function load() {
  error.value = null
  map.value = null
  try {
    map.value = await getLearningMap(id.value)
  } catch (e) {
    error.value = friendlyMessage(e)
  }
}
watch(id, load, { immediate: true })

const nodes = computed(() => (map.value ? toMapNodes(map.value.lessons) : []))
const character = computed<CharacterKey>(() => {
  const c = map.value?.lessons.find((l) => l.id === map.value?.assignment.current_lesson_id)?.character
  return CHARACTER_KEYS.find((k) => k === c) ?? 'momo'
})
const done = computed(() => map.value?.lessons.filter((l) => l.state === 'completed').length ?? 0)

function select(lessonId: string) {
  notice.value = null
  const lesson = map.value?.lessons.find((l) => l.id === lessonId)
  const to = lesson && lessonRoute(lesson)
  if (to) void router.push(to)
}

function locked(lessonId: string) {
  const lesson = map.value?.lessons.find((l) => l.id === lessonId)
  if (lesson && map.value) notice.value = `${lesson.title}: ${lockedReason(lesson, map.value)}`
}
</script>

<template>
  <EmptyScene v-if="error" tone="error" title="Haritan açılamadı" :description="error">
    <BaseButton @click="load">Tekrar dene</BaseButton>
  </EmptyScene>
  <LoadingScene v-else-if="!map" label="Haritan hazırlanıyor" character="momo" />
  <EmptyScene v-else-if="!map.lessons.length" title="Bu haritada henüz ders yok" description="Öğretmenin dersleri eklediğinde yolun burada belirecek.">
    <BaseButton as="router-link" to="/">Ana sayfaya dön</BaseButton>
  </EmptyScene>
  <WorldBackground v-else :character="character" intensity="rich" class="min-h-full">
    <div class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <header>
        <p class="type-eyebrow text-ink-soft">Öğrenme haritam</p>
        <h1 class="type-hero text-ink">Macera yolun</h1>
        <p class="text-ink-soft">{{ map.lessons.length }} dersten {{ done }} ders tamamlandı. Tamamladığın dersleri istediğin zaman tekrar oynayabilirsin.</p>
      </header>
      <div aria-live="polite">
        <CharacterBubble v-if="notice" :character="character" expression="thinking" size="sm">
          {{ notice }}
        </CharacterBubble>
      </div>
      <LearningMap :nodes="nodes" label="Öğrenme haritam" :character="character" @select="select" @locked="locked" />
    </div>
  </WorldBackground>
</template>
