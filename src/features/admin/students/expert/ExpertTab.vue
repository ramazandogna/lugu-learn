<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseInput } from 'rei-kit'
import type { TabPanel } from 'rei-kit/web'
import { listStats, type StatGroup, type StatMeta } from '@/domain/stats'
import { studentStatsInput } from '@/lib/api/admin'
import LoadState from '../../components/LoadState.vue'
import { SECTION_LABEL } from '../../lib/format'
import { useLoad } from '../../lib/use-load'
import DeclineStrip from './DeclineStrip.vue'
import ExpertCompare from './ExpertCompare.vue'
import ExpertStatCard from './ExpertStatCard.vue'
import ExpertToolbar from './ExpertToolbar.vue'
import LessonDrill from './LessonDrill.vue'
import { buildParams, GROUP_LABEL, GROUP_ORDER, periodUnitOf, prevParams, safeRun, type Controls } from './stat-format'
import EmptyState from '../../components/AdminEmpty.vue'
import BaseTabs from '../../components/ScrollTabs.vue'

const { studentId } = defineProps<{ studentId: string }>()

const now = ref(new Date().toISOString())
const state = useLoad(async () => {
  now.value = new Date().toISOString()
  return studentStatsInput(studentId)
}, () => studentId)

const controls = ref<Controls>({ window: 'all', from: '', to: '', n: 5, nth: null, metric: 'pct', subjectId: '', lessonId: '' })

type Mode = 'stats' | 'compare' | 'lesson'
const MODES: TabPanel<Mode>[] = [
  { key: 'stats', label: 'Göstergeler' },
  { key: 'compare', label: 'İki dönem kıyası' },
  { key: 'lesson', label: 'Ders gelişimi' },
]
const mode = ref<Mode>('stats')
const group = ref<StatGroup>('exam')
const groupTabs: TabPanel<StatGroup>[] = GROUP_ORDER.map((g) => ({ key: g, label: GROUP_LABEL[g] }))
const search = ref('')

watch(() => studentId, () => (controls.value = { ...controls.value, subjectId: '', lessonId: '', nth: null }))

const input = computed(() => state.data.value)
/** N. deneme default = the last one of the selected subject (or of all exams). */
const nthDefault = computed(() => {
  const i = input.value
  if (!i) return 1
  const ids = new Set(i.results.filter((r) => !controls.value.subjectId || r.subjectId === controls.value.subjectId).map((r) => r.examId))
  return Math.max(1, ids.size)
})

const norm = (s: string) => s.toLocaleLowerCase('tr-TR')
const usable = (m: StatMeta) => !m.needs.includes('statId')
const searching = computed(() => search.value.trim().length > 0)
/** Search spans all groups; otherwise the active group. */
const metas = computed(() => {
  const q = norm(search.value.trim())
  return listStats()
    .filter(usable)
    .filter((m) => (q ? norm(m.name).includes(q) : m.group === group.value))
})

const baseParams = computed(() => buildParams(controls.value, now.value, nthDefault.value))
const cards = computed(() => {
  const i = input.value
  if (!i || mode.value !== 'stats') return []
  return metas.value.map((meta) => {
    const p = meta.group === 'period'
      ? { ...baseParams.value, window: 'period' as const, periodUnit: periodUnitOf(controls.value), from: controls.value.from || undefined, to: controls.value.to || undefined }
      : baseParams.value
    const pp = meta.group === 'period' ? null : prevParams(p)
    return { meta, params: p, result: safeRun(meta.id, i, p), prev: pp ? safeRun(meta.id, i, pp) : null }
  })
})

const labels = computed(() => {
  const m = new Map<string, string>()
  for (const s of input.value?.subjects ?? []) m.set(s.id, s.name)
  for (const l of input.value?.lessons ?? []) m.set(l.id, `Ders ${l.sequence} · ${l.title}`)
  for (const [k, v] of Object.entries(SECTION_LABEL)) m.set(k, v)
  return m
})
const labelOf = (k: string) => labels.value.get(k) ?? k

function pickSubject(id: string) {
  controls.value = { ...controls.value, subjectId: id }
  mode.value = 'stats'
  group.value = 'exam'
}
function pickLesson(id: string) {
  controls.value = { ...controls.value, lessonId: id }
  mode.value = 'lesson'
}
</script>

<template>
  <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
    <div v-if="input" class="flex flex-col gap-4">
      <DeclineStrip :input="input" :now="now" :metric="controls.metric" @pick-subject="pickSubject" @open-lessons="mode = 'lesson'" />
      <ExpertToolbar v-model="controls" :input="input" />

      <BaseTabs v-model="mode" :items="MODES" label="Analiz görünümü">
        <template #default="{ active }">
          <div class="pt-4">
            <template v-if="active === 'stats'">
              <div class="mb-4 flex flex-col gap-3">
                <BaseInput v-model="search" type="search" label="Gösterge ara" placeholder="ör. eğim, doğruluk, streak" />
                <BaseTabs v-if="!searching" v-model="group" :items="groupTabs" label="Gösterge grupları">
                  <template #default><span class="sr-only">{{ GROUP_LABEL[group] }}</span></template>
                </BaseTabs>
                <p v-else class="text-ink-soft type-small">Tüm gruplarda {{ cards.length }} sonuç.</p>
              </div>
              <EmptyState v-if="!cards.length" title="Eşleşen gösterge yok" description="Aramayı kısaltmayı dene." />
              <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <ExpertStatCard v-for="c in cards" :key="c.meta.id" :meta="c.meta" :result="c.result" :prev="c.prev" :params="c.params" :label-of="labelOf" />
              </div>
            </template>

            <template v-else-if="active === 'compare'">
              <div class="mb-4 flex flex-col gap-3">
                <BaseInput v-model="search" type="search" label="Gösterge ara" placeholder="ör. doğruluk, aktif süre" />
                <BaseTabs v-if="!searching" v-model="group" :items="groupTabs.filter((g) => g.key !== 'period')" label="Gösterge grupları">
                  <template #default><span class="sr-only">{{ GROUP_LABEL[group] }}</span></template>
                </BaseTabs>
              </div>
              <ExpertCompare :input="input" :now="now" :controls="controls" :nth-default="nthDefault" :metas="metas" />
            </template>

            <LessonDrill v-else :input="input" :now="now" :controls="controls" @pick="pickLesson" />
          </div>
        </template>
      </BaseTabs>
    </div>
  </LoadState>
</template>
