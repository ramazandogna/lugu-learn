<script setup lang="ts">
/*
 * "Hangi haritada ilerlemek istersin?" — the map tab's entry. One program goes straight to its map; several
 * get a choice. The map's back link returns here, so switching programs is always one tap.
 */
import { computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { BaseButton } from 'rei-kit'
import { ChevronRight, Lock } from 'lucide-vue-next'

import { CharacterBubble, EmptyScene, JarProgress, LoadingScene } from '@/design'

import { useStudentHome } from './useStudentHome'

const router = useRouter()
const { home, error, refresh } = useStudentHome()
const programs = computed(() => home.value?.assignments ?? [])

watch(
  programs,
  (list) => {
    if (home.value && list.length === 1) void router.replace({ name: 'student-map', params: { assignmentId: list[0]!.id } })
  },
  { immediate: true },
)

function line(a: (typeof programs.value)[number]): string {
  if (a.status === 'paused') return 'Şu an duraklatıldı'
  if (!a.current_lesson) return 'Hepsini bitirdin! Tekrar oynayabilirsin.'
  if (a.current_lesson.teacher_locked) return `Sıradaki ders: ${a.current_lesson.title} · öğretmenin açacak`
  return `${a.current_lesson.in_progress ? 'Devam et' : 'Sıradaki'}: Ders ${a.current_lesson.sequence} · ${a.current_lesson.title}`
}
</script>

<template>
  <EmptyScene v-if="error && !home" tone="danger" title="Haritaların açılamadı" :description="error">
    <BaseButton @click="refresh">Tekrar dene</BaseButton>
  </EmptyScene>
  <LoadingScene v-else-if="!home || programs.length === 1" label="Haritan hazırlanıyor" character="momo" />
  <EmptyScene v-else-if="!programs.length" title="Henüz bir haritan yok" description="Öğretmenin sana bir program atayınca macera yolun burada belirecek.">
    <BaseButton as="router-link" to="/">Ana sayfaya dön</BaseButton>
  </EmptyScene>
  <div v-else class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
    <header>
      <p class="type-eyebrow text-ink-soft">Öğrenme haritalarım</p>
      <h1 class="type-hero text-ink">Hangi haritada ilerlemek istersin?</h1>
    </header>
    <CharacterBubble character="momo" size="sm">{{ programs.length }} haritan var. Birini seç; istediğin zaman geri dönüp diğerine geçebilirsin.</CharacterBubble>
    <ul class="flex flex-col gap-3" aria-label="Haritalarım">
      <li v-for="a in programs" :key="a.id">
        <RouterLink :to="{ name: 'student-map', params: { assignmentId: a.id } }" class="surface surface-interactive rounded-card focus-ring flex items-center gap-4 p-4">
          <JarProgress class="min-w-0 flex-1" :value="a.lessons_completed" :max="Math.max(1, a.lessons_total)" :label="`${a.lessons_total} dersten ${a.lessons_completed} ders tamamlandı`">
            <p class="type-task text-ink">{{ a.curriculum.name }}</p>
            <p class="type-small text-ink-soft flex items-center gap-1">
              <Lock v-if="a.current_lesson?.teacher_locked" :size="14" aria-hidden="true" />
              {{ line(a) }}
            </p>
            <p class="type-small text-ink-soft">
              {{ a.lessons_total }} dersten {{ a.lessons_completed }} tamam · %{{ a.lessons_total ? Math.round((100 * a.lessons_completed) / a.lessons_total) : 0 }}
            </p>
            <p v-if="a.current_lesson?.teacher_locked" class="type-small text-warning-ink font-bold">Sıradaki dersi öğretmenin açacak</p>
          </JarProgress>
          <ChevronRight :size="28" class="text-primary shrink-0" aria-hidden="true" />
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
