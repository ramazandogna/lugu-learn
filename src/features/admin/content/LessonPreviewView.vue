<script setup lang="ts">
/*
 * Admin test run of a lesson: the real student player on local grading (`student/lesson/preview.ts`).
 * Every section is open and skippable; nothing is saved. `?paket=<id>` tests a given revision,
 * otherwise the published one (else the newest non-archived draft).
 */
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { BaseButton } from 'rei-kit'
import { BaseDisclosure } from 'rei-kit/web'
import { LessonPackage } from '@/domain/content'
import { lessonContext, listPackages } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'
import LessonSpeakingPanel from './LessonSpeakingPanel.vue'
import PreviewPlayer from './PreviewPlayer.vue'

const route = useRoute()
const lessonId = computed(() => String(route.params.lessonId))
const wanted = computed(() => (typeof route.query.paket === 'string' ? route.query.paket : null))
const run = ref(0)

const state = useLoad(async () => {
  const [ctx, packages] = await Promise.all([lessonContext(lessonId.value), listPackages(lessonId.value)])
  const row = packages.find((p) => p.id === wanted.value) ?? packages.find((p) => p.status === 'published') ?? packages.find((p) => p.status !== 'archived')
  if (!row) throw new Error('Bu dersin test edilecek içeriği yok.')
  const parsed = LessonPackage.safeParse(row.content)
  if (!parsed.success) throw new Error(`Revizyon ${row.revision} geçerli bir ders paketi değil; önce düzenleyicide düzeltin.`)
  return { ...ctx, row, pkg: parsed.data }
}, () => [lessonId.value, wanted.value])
</script>

<template>
  <div class="flex flex-col gap-4">
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <template v-if="state.data.value">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <RouterLink :to="{ name: 'admin-lesson', params: { lessonId } }" class="focus-ring rounded-cell text-ink-soft w-fit type-small hover:underline">
            ‹ {{ state.data.value.lesson.sequence }}. {{ state.data.value.lesson.title }} · revizyon {{ state.data.value.row.revision }}
          </RouterLink>
          <BaseButton size="sm" variant="secondary" @click="run++">Baştan başlat</BaseButton>
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
