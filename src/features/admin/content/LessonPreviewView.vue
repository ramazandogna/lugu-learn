<script setup lang="ts">
/*
 * Admin test run of a lesson: the real student player on local grading (`student/lesson/preview.ts`).
 * Every section is open and skippable; nothing is saved. `?paket=<id>` tests a given revision,
 * otherwise the published one (else the newest non-archived draft).
 */
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseBadge, BaseButton } from 'rei-kit'
import { BaseDisclosure } from 'rei-kit/web'
import { LessonPackage } from '@/domain/content'
import { lessonContext, listPackages } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'
import LessonSpeakingPanel from './LessonSpeakingPanel.vue'
import PreviewPlayer from './PreviewPlayer.vue'

const route = useRoute()
const router = useRouter()
const lessonId = computed(() => String(route.params.lessonId))
const wanted = computed(() => (typeof route.query.paket === 'string' ? route.query.paket : null))
const run = ref(0)

function close() {
  if (window.history.state?.back) router.back()
  else void router.push({ name: 'admin-curricula' })
}

const state = useLoad(async () => {
  const [ctx, packages] = await Promise.all([lessonContext(lessonId.value), listPackages(lessonId.value)])
  const row = packages.find((p) => p.id === wanted.value) ?? packages.find((p) => p.status === 'published') ?? packages.find((p) => p.status !== 'archived')
  if (!row) throw new Error('Bu dersin test edilecek içeriği yok.')
  const parsed = LessonPackage.safeParse(row.content)
  if (!parsed.success) throw new Error(`Revizyon ${row.revision} geçerli bir ders paketi değil.`)
  return { ...ctx, row, pkg: parsed.data }
}, () => [lessonId.value, wanted.value])
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="surface sticky top-[var(--header-h)] z-10 flex flex-wrap items-center justify-between gap-2 rounded-card p-3" role="status">
      <p class="font-semibold">Dersi dene — Hiçbir şey kaydedilmez</p>
      <BaseButton size="sm" variant="secondary" @click="close">Kapat</BaseButton>
    </div>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <template v-if="state.data.value">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-ink-soft type-small">{{ state.data.value.lesson.sequence }}. {{ state.data.value.lesson.title }} · revizyon {{ state.data.value.row.revision }}</p>
          <span class="flex flex-wrap items-center gap-2">
            <BaseBadge :tone="state.data.value.row.status === 'published' ? 'success' : 'warning'">{{ state.data.value.row.status === 'published' ? 'Yayındaki sürüm' : 'Taslak' }}</BaseBadge>
            <BaseButton size="sm" variant="secondary" @click="run++">Baştan başlat</BaseButton>
          </span>
        </div>
        <BaseDisclosure title="Bu dersin 1 saatlik konuşma planı" :heading-level="2">
          <LessonSpeakingPanel :lesson-id="lessonId" :package-id="state.data.value.row.id" />
        </BaseDisclosure>
        <div class="rounded-card overflow-hidden">
          <PreviewPlayer :key="`${state.data.value.row.id}-${run}`" :lesson-id="lessonId" :package-id="state.data.value.row.id" :pkg="state.data.value.pkg" />
        </div>
      </template>
    </LoadState>
  </div>
</template>
