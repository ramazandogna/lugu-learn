<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseCard, BaseSelect, SegmentedControl } from 'rei-kit'
import { lessonLearning, listAllLessons, listStudents, studentLearning } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useLoad } from '../lib/use-load'
import AnalyticsPanel from './AnalyticsPanel.vue'
import EmptyState from '../components/AdminEmpty.vue'
import PageHeader from '../components/AdminPageHeader.vue'

type Scope = 'student' | 'lesson'
const route = useRoute()
const router = useRouter()
const query = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : undefined)

const scope = computed<Scope>({
  get: () => (query('kapsam') === 'ders' ? 'lesson' : 'student'),
  set: (v) => void router.replace({ query: { kapsam: v === 'lesson' ? 'ders' : 'ogrenci' } }),
})
const target = computed<string | undefined>({
  get: () => query('id'),
  set: (v) => void router.replace({ query: { ...route.query, id: v } }),
})

const options = useLoad(async () => {
  const [students, lessons] = await Promise.all([listStudents(), listAllLessons()])
  return {
    student: students.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })),
    lesson: lessons.map((l) => ({ value: l.id, label: `${l.curriculumName} s${l.version} · ${l.sequence}. ${l.title}` })),
  }
})

const data = useLoad(
  async () => (target.value ? (scope.value === 'student' ? studentLearning(target.value) : lessonLearning(target.value)) : null),
  () => `${scope.value}:${target.value ?? ''}`,
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Öğrenme Analitiği" as="h1" />
    <BaseCard as="section" aria-label="Kapsam">
      <LoadState :loading="options.loading.value" :error="options.error.value" @retry="options.reload">
        <div v-if="options.data.value" class="flex flex-wrap items-end gap-4">
          <SegmentedControl
            v-model="scope"
            aria-label="Analiz kapsamı"
            :options="[
              { value: 'student', label: 'Öğrenci' },
              { value: 'lesson', label: 'Ders' },
            ]"
          />
          <BaseSelect
            v-model="target"
            class="min-w-80 flex-1"
            :label="scope === 'student' ? 'Öğrenci' : 'Ders'"
            placeholder="Seçin"
            :options="options.data.value[scope]"
          />
        </div>
      </LoadState>
    </BaseCard>
    <p class="text-ink-soft max-w-(--measure-reading) type-small">
      Buradaki sayılar gözlemdir, yargı değil: süre tek başına bir zayıflık göstermez ve küçük örneklemlerde örüntü adı verilmez.
    </p>
    <EmptyState v-if="!target" :title="scope === 'student' ? 'Bir öğrenci seçin' : 'Bir ders seçin'" />
    <LoadState v-else :loading="data.loading.value" :error="data.error.value" @retry="data.reload">
      <AnalyticsPanel v-if="data.data.value" :data="data.data.value" :scope="scope" />
    </LoadState>
  </div>
</template>
