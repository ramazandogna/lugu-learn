<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { BaseButton, SkeletonList } from 'rei-kit'
import { Lock, Trophy } from 'lucide-vue-next'

import { EmptyScene, WorldBackground, XpBadge } from '@/design'
import { friendlyMessage, getAchievements } from '@/lib/api/student'

import { useStudentHome } from './useStudentHome'

/* The learner's own XP and badges. No ranking, no comparison with anyone else. */
type Data = Awaited<ReturnType<typeof getAchievements>>
const data = shallowRef<Data | null>(null)
const error = ref<string | null>(null)
const { home } = useStudentHome()

async function load() {
  error.value = null
  try {
    data.value = await getAchievements()
  } catch (e) {
    error.value = friendlyMessage(e)
  }
}
onMounted(load)

const earned = computed(() => data.value?.achievements.filter((a) => a.awardedAt) ?? [])
const ahead = computed(() => data.value?.achievements.filter((a) => !a.awardedAt) ?? [])
const fmtDate = (d: string) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))
const REASON = { lesson_completed: 'Ders tamamlandı', achievement: 'Rozet kazandın', manual: 'Öğretmeninden' } as const
const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(n)
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
    <WorldBackground character="sasha" intensity="rich" class="rounded-card overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p class="type-eyebrow text-ink-soft">Başarılarım</p>
          <h1 class="type-hero text-ink">Topladıkların</h1>
        </div>
        <XpBadge v-if="home" :xp="home.xp" :label="`Toplam ${fmt(home.xp)} XP`" />
      </div>
    </WorldBackground>

    <EmptyScene v-if="error" tone="error" title="Başarıların açılamadı" :description="error">
      <BaseButton @click="load">Tekrar dene</BaseButton>
    </EmptyScene>
    <SkeletonList v-else-if="!data" :rows="4" />
    <template v-else>
      <section aria-labelledby="earned-title" class="flex flex-col gap-3">
        <h2 id="earned-title" class="type-section text-ink">Kazandığın rozetler ({{ earned.length }})</h2>
        <EmptyScene v-if="!earned.length" compact title="İlk rozetin yolda!" description="Dersleri tamamladıkça rozetler burada birikecek." />
        <ul v-else class="grid gap-3 sm:grid-cols-2">
          <li v-for="a in earned" :key="a.id" class="surface rounded-card flex items-start gap-3 p-4">
            <Trophy :size="28" class="text-accent shrink-0" aria-hidden="true" />
            <div>
              <p class="type-task text-ink">{{ a.title }}</p>
              <p v-if="a.description" class="text-ink-soft text-sm">{{ a.description }}</p>
              <p class="text-ink-soft text-sm">{{ fmtDate(a.awardedAt!) }}<template v-if="a.xp"> · +{{ a.xp }} XP</template></p>
            </div>
          </li>
        </ul>
      </section>

      <section v-if="ahead.length" aria-labelledby="ahead-title" class="flex flex-col gap-3">
        <h2 id="ahead-title" class="type-section text-ink">Sıradaki rozetler</h2>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="a in ahead" :key="a.id" class="surface rounded-card flex items-start gap-3 border-2 border-dashed border-hair p-4">
            <Lock :size="24" class="text-ink-soft shrink-0" aria-hidden="true" />
            <div>
              <p class="type-task text-ink">{{ a.title }} <span class="sr-only">(henüz kazanılmadı)</span></p>
              <p v-if="a.description" class="text-ink-soft text-sm">{{ a.description }}</p>
              <p v-else-if="a.kind === 'lessons_completed' && a.threshold" class="text-ink-soft text-sm">{{ a.threshold }} ders tamamlayınca</p>
            </div>
          </li>
        </ul>
      </section>

      <section v-if="data.rewards.length" aria-labelledby="xp-title" class="flex flex-col gap-3">
        <h2 id="xp-title" class="type-section text-ink">XP geçmişin</h2>
        <ul class="surface rounded-card divide-hair divide-y">
          <li v-for="r in data.rewards" :key="r.id" class="flex items-center justify-between gap-3 px-4 py-3">
            <span class="text-ink">{{ r.note || REASON[r.reason] }}<span class="text-ink-soft block text-sm">{{ fmtDate(r.created_at) }}</span></span>
            <span class="text-ink font-bold">+{{ fmt(r.amount) }} XP</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
