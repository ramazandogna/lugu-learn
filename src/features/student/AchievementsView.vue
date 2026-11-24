<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, SkeletonList } from 'rei-kit'
import { Snowflake } from 'lucide-vue-next'

import { BadgeJar, EmptyScene, JarProgress, LuguMascot, WorldBackground, XpBadge } from '@/design'
import { friendlyMessage, getAchievements } from '@/lib/api/student'

import StreakChain from './components/StreakChain.vue'
import { MAX_LEVEL, levelOf } from './progress'
import { useProgress } from './useProgress'
import { useStudentHome } from './useStudentHome'

/* The learner's own XP and badges. No ranking, no comparison with anyone else. */
type Data = Awaited<ReturnType<typeof getAchievements>>
const data = shallowRef<Data | null>(null)
const error = ref<string | null>(null)
const { home } = useStudentHome()
const { streak, weekly, ready: progressReady } = useProgress()

const level = computed(() => levelOf(home.value?.xp ?? 0))
const lessonsDone = computed(() => (home.value?.assignments ?? []).reduce((n, a) => n + a.lessons_completed, 0))
/** The nearest badge that is earned by finishing lessons: "X to go". */
const nextBadge = computed(() => {
  const list = (data.value?.achievements ?? []).filter((a) => !a.awardedAt && a.kind === 'lessons_completed' && a.threshold && a.threshold > lessonsDone.value)
  return list.sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0))[0] ?? null
})
const harder = computed(() => weekly.value.enough && weekly.value.thisWeek.minutes < weekly.value.lastWeek.minutes)
const JARS = computed(() => [
  { key: 'last', title: 'Geçen haftaki sen', s: weekly.value.lastWeek },
  { key: 'this', title: 'Bu haftaki sen', s: weekly.value.thisWeek },
])

async function load() {
  error.value = null
  try {
    data.value = await getAchievements()
  } catch (e) {
    error.value = friendlyMessage(e)
  }
}
onMounted(load)

const earned = computed(() => (data.value?.achievements.filter((a) => a.awardedAt) ?? []).slice(0, 40))
const ahead = computed(() => data.value?.achievements.filter((a) => !a.awardedAt) ?? [])
const fmtDate = (d: string) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))
const REASON = { lesson_completed: 'Ders tamamlandı', achievement: 'Rozet kazandın', manual: 'Öğretmeninden' } as const
const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(n)
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
    <WorldBackground character="sasha" intensity="rich" class="rounded-card overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
        <div>
          <p class="type-eyebrow text-ink-soft">Başarılarım</p>
          <h1 class="type-hero text-ink">Topladıkların</h1>
        </div>
        <XpBadge v-if="home" :xp="home.xp" :label="`Toplam ${fmt(home.xp)} XP`" />
      </div>
    </WorldBackground>

    <section aria-labelledby="journey-title" class="grid gap-4 md:grid-cols-2">
      <h2 id="journey-title" class="sr-only">Yolculuğum</h2>

      <div class="surface rounded-card animate-rise flex flex-col gap-3 p-4 sm:p-6">
        <p class="type-eyebrow text-ink-soft">Seviye</p>
        <JarProgress
          :value="level.into"
          :max="level.need"
          size="lg"
          :label="level.max ? 'En üst seviyedesin!' : `Sonraki seviyeye ${level.need - level.into} XP kaldı`"
        >
          <p class="type-display text-ink">{{ level.level }} <span class="type-small text-ink-soft">/ {{ MAX_LEVEL }}</span></p>
          <p class="type-small text-ink">{{ level.max ? 'En üst seviyedesin!' : `Sonraki seviyeye ${level.need - level.into} XP kaldı` }}</p>
        </JarProgress>
      </div>

      <div class="surface rounded-card animate-rise flex flex-col gap-3 p-4 sm:p-6" style="animation-delay: 60ms">
        <p class="type-eyebrow text-ink-soft">Günlük zincir</p>
        <template v-if="progressReady">
          <p class="type-display text-ink">{{ streak.current }} <span class="type-small text-ink-soft">gün · en uzun {{ streak.best }}</span></p>
          <StreakChain :streak="streak" />
          <p class="type-small text-ink-soft flex items-center gap-1">
            <Snowflake :size="16" aria-hidden="true" /> {{ streak.freezes }} dondurma hakkın var.
            <template v-if="streak.mood === 'back'"> Geri geldin! Zincir yeniden başlıyor, rekorun duruyor.</template>
          </p>
        </template>
        <p v-else class="type-body text-ink-soft">Zincirin hazırlanıyor.</p>
      </div>

      <div class="surface rounded-card flex flex-col gap-3 p-4 sm:p-6 md:col-span-2">
        <div class="flex items-center gap-3">
          <LuguMascot character="piko" :expression="harder ? 'encouraging' : 'happy'" :size="56" />
          <div>
            <p class="type-eyebrow text-ink-soft">Haftalık özet</p>
            <p class="type-task text-ink">
              {{
                !weekly.enough
                  ? 'İlk haftan, çizgi yeni başlıyor.'
                  : harder
                    ? 'Geçen hafta hızlı gittin. Bu hafta küçük bir adımla devam edelim.'
                    : 'Geçen haftaki sen yolu açtı, bu hafta da devam ediyorsun!'
              }}
            </p>
          </div>
        </div>
        <ul v-if="weekly.enough" class="grid grid-cols-2 gap-3">
          <li v-for="j in JARS" :key="j.key" class="bg-wash rounded-tile flex flex-col gap-1 p-3" :class="j.key === 'this' ? 'border-primary border-2' : ''">
            <p class="type-eyebrow text-ink-soft">{{ j.title }}</p>
            <p class="type-display text-ink">{{ j.s.minutes }} <span class="type-small text-ink-soft">dk</span></p>
            <p class="type-small text-ink">{{ j.s.days }} gün · {{ j.s.lessons }} ders bitti</p>
          </li>
        </ul>
        <RouterLink v-if="harder" to="/" class="type-task text-primary focus-ring self-start font-bold underline">Küçük adımı at</RouterLink>
      </div>

      <div v-if="nextBadge" class="surface rounded-card animate-rise flex flex-col gap-2 p-4 sm:p-6 md:col-span-2" style="animation-delay: 120ms">
        <p class="type-eyebrow text-ink-soft">Sıradaki rozet</p>
        <JarProgress
          :value="Math.min(lessonsDone, nextBadge.threshold ?? 1)"
          :max="nextBadge.threshold ?? 1"
          :label="`Rozete ${(nextBadge.threshold ?? 0) - lessonsDone} ders kaldı`"
        >
          <p class="type-task text-ink">{{ nextBadge.title }}</p>
          <p class="type-small text-ink-soft">Rozete {{ (nextBadge.threshold ?? 0) - lessonsDone }} ders kaldı</p>
        </JarProgress>
      </div>
    </section>

    <EmptyScene v-if="error" tone="danger" title="Başarıların açılamadı" :description="error">
      <BaseButton @click="load">Tekrar dene</BaseButton>
    </EmptyScene>
    <SkeletonList v-else-if="!data" :rows="4" />
    <template v-else>
      <section aria-labelledby="earned-title" class="flex flex-col gap-3">
        <h2 id="earned-title" class="type-section text-ink">Kütüphane rafım: kazandığın rozetler ({{ earned.length }})</h2>
        <EmptyScene v-if="!earned.length" compact title="İlk rozetin yolda!" description="Dersleri tamamladıkça rozetler burada birikecek." />
        <ul v-else class="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
          <li v-for="(a, i) in earned" :key="a.id" class="shelf animate-rise flex flex-col items-center gap-1 px-2 pb-3 text-center" :style="{ animationDelay: `${Math.min(i, 8) * 60}ms` }">
            <BadgeJar earned />
            <p class="type-task text-ink">{{ a.title }}</p>
            <p v-if="a.description" class="text-ink-soft type-small">{{ a.description }}</p>
            <p class="text-ink-soft type-small">{{ fmtDate(a.awardedAt!) }}<template v-if="a.xp"> · +{{ a.xp }} XP</template></p>
          </li>
        </ul>
      </section>

      <section v-if="ahead.length" aria-labelledby="ahead-title" class="flex flex-col gap-3">
        <h2 id="ahead-title" class="type-section text-ink">Rafta bekleyen boş kavanozlar</h2>
        <ul class="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
          <li v-for="(a, i) in ahead" :key="a.id" class="shelf animate-rise flex flex-col items-center gap-1 px-2 pb-3 text-center" :style="{ animationDelay: `${Math.min(i, 8) * 60}ms` }">
            <BadgeJar :earned="false" />
            <p class="type-task text-ink">{{ a.title }} <span class="sr-only">(henüz kazanılmadı)</span></p>
            <p v-if="a.description" class="text-ink-soft type-small">{{ a.description }}</p>
            <p v-else-if="a.kind === 'lessons_completed' && a.threshold" class="text-ink-soft type-small">{{ a.threshold }} ders tamamlayınca</p>
          </li>
        </ul>
      </section>

      <section v-if="data.rewards.length" aria-labelledby="xp-title" class="flex flex-col gap-3">
        <h2 id="xp-title" class="type-section text-ink">XP geçmişin</h2>
        <ul class="surface rounded-card divide-hair divide-y">
          <li v-for="r in data.rewards" :key="r.id" class="flex items-center justify-between gap-3 px-4 py-3">
            <span class="text-ink">{{ r.note || REASON[r.reason] }}<span class="text-ink-soft block type-small">{{ fmtDate(r.created_at) }}</span></span>
            <span class="text-ink font-bold">+{{ fmt(r.amount) }} XP</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* The plank the jars stand on. */
.shelf {
  border-bottom: 6px solid var(--color-hair);
  border-radius: 0 0 var(--radius-control) var(--radius-control);
}
</style>
