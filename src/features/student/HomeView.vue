<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, ProgressBar } from 'rei-kit'
import { Clock, Sparkles, Star, Trophy } from 'lucide-vue-next'

import { AvatarArt, CharacterBubble, EmptyScene, LoadingScene, WorldBackground } from '@/design'

import UpcomingLessons from './components/UpcomingLessons.vue'
import { greetingName, isAvatarKey } from './profile'
import { greeting, lineOfTheDay } from './motivation'
import { useStudentHome } from './useStudentHome'

const { home, error, refresh, mainAssignment } = useStudentHome()
onMounted(() => void refresh())

const name = computed(() => greetingName(home.value?.profile ?? null))
const avatar = computed(() => {
  const k = home.value?.profile?.avatar_key
  return isAvatarKey(k) ? k : null
})
const current = computed(() => mainAssignment.value?.current_lesson ?? null)
const paused = computed(() => mainAssignment.value?.status === 'paused')
const others = computed(() => (home.value?.assignments ?? []).filter((a) => a.id !== mainAssignment.value?.id))
const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(n)
</script>

<template>
  <EmptyScene v-if="error && !home" tone="danger" title="Ana sayfan açılamadı" :description="error">
    <BaseButton @click="refresh">Tekrar dene</BaseButton>
  </EmptyScene>
  <LoadingScene v-else-if="!home" label="Ana sayfan hazırlanıyor" />
  <div v-else class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
    <WorldBackground character="piko" intensity="rich" class="rounded-card overflow-hidden">
      <div class="flex items-center gap-4 p-4 sm:p-6">
        <AvatarArt v-if="avatar" :avatar="avatar" :size="72" />
        <div class="min-w-0">
          <p class="type-eyebrow text-ink-soft">{{ greeting() }}</p>
          <h1 class="type-hero text-ink">{{ name ? `${name}!` : 'Hoş geldin!' }}</h1>
          <p class="type-body text-ink-soft mt-1">{{ lineOfTheDay() }}</p>
        </div>
      </div>
    </WorldBackground>

    <EmptyScene v-if="!mainAssignment" title="Henüz bir programın yok" description="Öğretmenin sana bir program atadığında ilk dersin burada görünecek." />

    <template v-else>
      <section aria-labelledby="current-title" class="surface rounded-card flex flex-col gap-4 p-4 sm:p-6">
        <template v-if="current && !paused">
          <div>
            <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }} · Ders {{ current.sequence }}</p>
            <h2 id="current-title" class="type-title text-ink">{{ current.title }}</h2>
            <p v-if="current.tagline" class="type-body text-ink-soft mt-1">{{ current.tagline }}</p>
            <p class="text-ink-soft mt-2 flex items-center gap-1 type-small">
              <Clock :size="16" aria-hidden="true" /> Yaklaşık {{ current.estimated_minutes }} dakika
            </p>
          </div>
          <BaseButton as="router-link" :to="`/ders/${current.id}`" size="lg" class="self-start">
            {{ current.in_progress ? 'Kaldığın yerden devam et' : 'Derse başla' }}
          </BaseButton>
        </template>
        <template v-else-if="paused">
          <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }}</p>
          <h2 id="current-title" class="type-section text-ink">Programın şu an duraklatıldı</h2>
          <p class="type-body text-ink-soft">Öğretmenin programı yeniden açınca kaldığın yerden devam edeceksin. Bitirdiğin dersleri haritadan tekrar oynayabilirsin.</p>
        </template>
        <template v-else>
          <p class="type-eyebrow text-ink-soft">{{ mainAssignment.curriculum.name }}</p>
          <h2 id="current-title" class="type-section text-ink">Programını tamamladın!</h2>
          <p class="type-body text-ink-soft">Tüm dersleri bitirdin. İstediğin dersi haritadan tekrar oynayabilirsin.</p>
        </template>
        <ProgressBar
          :value="mainAssignment.lessons_completed"
          :max="Math.max(1, mainAssignment.lessons_total)"
          :label="`${mainAssignment.lessons_total} dersten ${mainAssignment.lessons_completed} ders tamamlandı`"
        />
      </section>
      <BaseButton as="router-link" :to="`/harita/${mainAssignment.id}`" variant="secondary" class="self-start">Haritamı aç</BaseButton>

      <UpcomingLessons :key="mainAssignment.id" :assignment-id="mainAssignment.id" />

      <section v-if="others.length" aria-labelledby="other-title" class="flex flex-col gap-3">
        <h2 id="other-title" class="type-section text-ink">Diğer programların</h2>
        <RouterLink
          v-for="a in others"
          :key="a.id"
          :to="`/harita/${a.id}`"
          class="surface surface-interactive rounded-card flex min-h-11 items-center justify-between gap-3 p-4"
        >
          <span class="type-task text-ink">{{ a.curriculum.name }}</span>
          <span class="text-ink-soft type-small">{{ a.lessons_completed }} / {{ a.lessons_total }}</span>
        </RouterLink>
      </section>
    </template>

    <section aria-labelledby="peek-title" class="grid gap-4 sm:grid-cols-3">
      <h2 id="peek-title" class="sr-only">Özetim</h2>
      <div class="surface rounded-card flex flex-col gap-2 p-4">
        <p class="type-eyebrow text-ink-soft">Toplam puanın</p>
        <p class="type-display text-ink">{{ fmt(home.xp) }}</p>
        <p class="type-small text-ink-soft flex items-center gap-1"><Star :size="16" aria-hidden="true" /> XP</p>
      </div>
      <RouterLink to="/basarilar" class="surface surface-interactive rounded-card flex flex-col gap-2 p-4">
        <p class="type-eyebrow text-ink-soft">Başarıların</p>
        <p class="type-display text-ink">{{ home.achievements_count }}</p>
        <p class="type-small text-ink-soft flex items-center gap-1"><Trophy :size="16" aria-hidden="true" /> rozet</p>
      </RouterLink>
      <div class="surface rounded-card flex flex-col gap-2 p-4">
        <p class="type-eyebrow text-ink-soft">Öğrendiğin kelimeler</p>
        <p class="type-display text-ink">{{ fmt(home.mastered_words) }}</p>
        <p class="type-small text-ink-soft flex items-center gap-1"><Sparkles :size="16" aria-hidden="true" /> kelime</p>
      </div>
    </section>

    <CharacterBubble v-if="current && !paused" character="sasha" size="sm">
      Bugünkü dersin seni bekliyor. Molaya ihtiyacın olursa bölümler arasında verebilirsin!
    </CharacterBubble>
  </div>
</template>
