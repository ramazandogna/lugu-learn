<script setup lang="ts">
/*
 * The student's way through their programs, one row per lesson: what the lesson teaches (its objectives),
 * how it went (stars, score, time, words, accuracy) and the speaking sessions held on it (how many, which
 * targets were reached, what was talked about). Answers "what have we covered, and what did it bring?".
 */
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, Lock, MessagesSquare, Play, Star } from 'lucide-vue-next'
import { BaseBadge, BaseCard, BaseSwitch } from 'rei-kit'
import { BaseDisclosure } from 'rei-kit/web'
import { listAssignments, listSpeakingSessions, noteTargets, speakingNotesFor, type LearningData } from '@/lib/api/admin'
import LoadState from '../../components/LoadState.vue'
import { formatDate, formatPercent } from '../../lib/format'
import { useLoad } from '../../lib/use-load'

const { studentId, data } = defineProps<{ studentId: string; data: LearningData }>()

const state = useLoad(async () => {
  const [assignments, speaking] = await Promise.all([listAssignments(studentId), listSpeakingSessions({ studentId })])
  const held = speaking.filter((s) => s.status !== 'cancelled')
  const notes = await speakingNotesFor(held.map((s) => s.id))
  return { assignments: assignments.filter((a) => a.assignment.status !== 'archived'), speaking: held, notes }
})
const showAll = ref(false)

type Mark = 'done' | 'current' | 'open' | 'locked'
const MARK = {
  done: { label: 'Tamamlandı', tone: 'success' },
  current: { label: 'Şu an burada', tone: 'primary' },
  open: { label: 'Açık, sırada', tone: 'neutral' },
  locked: { label: 'Kilitli', tone: 'neutral' },
} as const

const minutes = (s: number) => (s >= 60 ? `${Math.round(s / 60)} dk` : s > 0 ? '<1 dk' : '—')

const programs = computed(() => {
  const d = state.data.value
  if (!d) return []
  const lessonOfSession = new Map(data.sessions.map((s) => [s.id, s.lesson_id]))
  return d.assignments.map((a) => {
    const lessons = a.lessons
      .filter((l) => l.status !== 'archived')
      .map((l) => {
        const done = a.completedLessonIds.has(l.id)
        const isOpen = a.assignment.open_lesson_ids === null || a.assignment.open_lesson_ids.includes(l.id)
        const mark: Mark = done ? 'done' : l.id === a.assignment.current_lesson_id && isOpen ? 'current' : isOpen ? 'open' : 'locked'
        const completion = data.completions.filter((c) => c.lesson_id === l.id).at(-1)
        const summary = (completion?.summary ?? {}) as { stars?: number; assessment_percent?: number | null }
        const seconds = data.sessions.filter((s) => s.lesson_id === l.id).reduce((n, s) => n + s.active_seconds, 0)
        const attempts = data.attempts.filter((x) => lessonOfSession.get(x.session_id) === l.id)
        const pkgIds = new Set([...data.packages].filter(([, p]) => p.lessonId === l.id).map(([id]) => id))
        const words = data.mastery.filter((m) => pkgIds.has(m.package_id))
        const content = [...data.packages.values()].find((p) => p.lessonId === l.id)?.content as { meta?: { objectives?: { text: string }[] } } | undefined
        const talks = d.speaking.filter((s) => s.lesson_id === l.id)
        const talkNotes = d.notes.filter((n) => talks.some((s) => s.id === n.speaking_session_id))
        const targets = talkNotes.flatMap((n) => noteTargets(n))
        return {
          lesson: l,
          mark,
          stars: summary.stars ?? null,
          percent: summary.assessment_percent ?? null,
          completedAt: completion?.completed_at ?? null,
          time: minutes(seconds),
          accuracy: attempts.length ? attempts.filter((x) => x.correct).length / attempts.length : null,
          words: { total: words.length, mastered: words.filter((m) => m.mastered_at).length },
          objectives: content?.meta?.objectives?.map((o) => o.text) ?? [],
          talks: talks.map((s) => ({ id: s.id, at: s.started_at ?? s.planned_at, topics: talkNotes.find((n) => n.speaking_session_id === s.id)?.topics ?? null })),
          targets: { total: targets.length, met: targets.filter((t) => t.result === 'met').length, partly: targets.filter((t) => t.result === 'partly').length, list: targets },
          touched: done || mark === 'current' || seconds > 0 || talks.length > 0,
        }
      })
    return { id: a.assignment.id, name: a.curriculumName, lessons }
  })
})
const visible = (rows: (typeof programs.value)[number]['lessons']) => (showAll.value ? rows : rows.filter((r) => r.touched))
const totals = computed(() => {
  const rows = programs.value.flatMap((p) => p.lessons)
  const targets = rows.reduce((n, r) => n + r.targets.total, 0)
  return {
    talks: state.data.value?.speaking.filter((s) => s.status === 'ended').length ?? 0,
    targets,
    met: rows.reduce((n, r) => n + r.targets.met, 0),
  }
})
const TARGET_LABEL = { met: 'Kazanıldı', partly: 'Kısmen', not: 'Henüz değil' } as const
</script>

<template>
  <BaseCard as="section" aria-labelledby="journey-title">
    <template #head>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="journey-title" class="type-body font-semibold">Ders ders yolculuk</h2>
          <p class="text-ink-soft type-small">
            Her ders: ne öğretiyor, nasıl geçti, üzerine kaç konuşma yaptık.
            <template v-if="totals.talks"> Toplam {{ totals.talks }} konuşma oturumu<template v-if="totals.targets"> · {{ totals.targets }} hedefin {{ totals.met }}'i kazanıldı</template>.</template>
          </p>
        </div>
        <BaseSwitch v-model="showAll" label="Başlanmamış dersleri de göster" />
      </div>
    </template>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <p v-if="!programs.length" class="text-ink-soft type-small">Program atanmadı.</p>
      <div v-for="p in programs" :key="p.id" class="flex flex-col gap-2">
        <h3 v-if="programs.length > 1" class="type-small text-ink-soft mt-2 font-semibold uppercase tracking-wide">{{ p.name }}</h3>
        <p v-if="!visible(p.lessons).length" class="text-ink-soft type-small">Bu programda henüz başlanan ders yok.</p>
        <ol class="flex flex-col gap-2">
          <li v-for="r in visible(p.lessons)" :key="r.lesson.id" class="border-hair rounded-tile border p-3" :class="r.mark === 'current' ? 'border-primary' : ''">
            <div class="flex flex-wrap items-center gap-2">
              <Check v-if="r.mark === 'done'" :size="18" class="text-positive shrink-0" aria-hidden="true" />
              <Play v-else-if="r.mark === 'current'" :size="18" class="text-primary shrink-0" aria-hidden="true" />
              <Lock v-else-if="r.mark === 'locked'" :size="18" class="text-ink-soft shrink-0" aria-hidden="true" />
              <span class="type-body text-ink min-w-0 flex-1 font-semibold">{{ r.lesson.sequence }}. {{ r.lesson.title }}</span>
              <BaseBadge :tone="MARK[r.mark].tone">{{ MARK[r.mark].label }}</BaseBadge>
            </div>
            <dl class="type-small text-ink-soft mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-5">
              <div><dt class="sr-only">Yıldız</dt><dd class="flex items-center gap-1"><Star :size="14" aria-hidden="true" /> {{ r.stars !== null ? `${r.stars}/3` : '—' }}</dd></div>
              <div><dt class="inline">Puan </dt><dd class="text-ink inline font-semibold">{{ r.percent !== null ? `%${Math.round(r.percent)}` : '—' }}</dd></div>
              <div><dt class="inline">Süre </dt><dd class="text-ink inline font-semibold">{{ r.time }}</dd></div>
              <div><dt class="inline">Doğruluk </dt><dd class="text-ink inline font-semibold">{{ formatPercent(r.accuracy) }}</dd></div>
              <div><dt class="inline">Kelime </dt><dd class="text-ink inline font-semibold">{{ r.words.total ? `${r.words.mastered}/${r.words.total}` : '—' }}</dd></div>
            </dl>
            <p v-if="r.completedAt" class="type-small text-ink-soft mt-1">Bitirdiği gün: {{ formatDate(r.completedAt) }}</p>
            <BaseDisclosure v-if="r.objectives.length || r.talks.length" class="mt-2" :heading-level="4"
              :title="`Ne öğrendik${r.talks.length ? ` · ${r.talks.length} konuşma${r.targets.total ? `, ${r.targets.total} hedefin ${r.targets.met}'i kazanıldı` : ''}` : ''}`">
              <div class="flex flex-col gap-3">
                <div v-if="r.objectives.length">
                  <p class="type-small text-ink font-semibold">Dersin kazanımları</p>
                  <ul class="type-small text-ink-soft list-disc ps-5">
                    <li v-for="o in r.objectives" :key="o">{{ o }}</li>
                  </ul>
                </div>
                <div v-if="r.targets.total">
                  <p class="type-small text-ink font-semibold">Konuşma hedefleri</p>
                  <ul class="type-small flex flex-col gap-1">
                    <li v-for="(t, i) in r.targets.list" :key="i" class="flex flex-wrap items-center gap-2">
                      <BaseBadge :tone="t.result === 'met' ? 'success' : t.result === 'partly' ? 'warning' : 'neutral'">{{ t.result ? TARGET_LABEL[t.result] : 'Değerlendirilmedi' }}</BaseBadge>
                      <span class="text-ink">{{ t.text }}</span>
                    </li>
                  </ul>
                </div>
                <div v-if="r.talks.length">
                  <p class="type-small text-ink font-semibold">Konuşma oturumları</p>
                  <ul class="type-small flex flex-col gap-1">
                    <li v-for="s in r.talks" :key="s.id">
                      <RouterLink class="focus-ring rounded-cell text-primary inline-flex min-h-10 items-center gap-1 hover:underline" :to="{ name: 'admin-speaking-session', params: { sessionId: s.id } }">
                        <MessagesSquare :size="14" aria-hidden="true" /> {{ s.at ? formatDate(s.at) : 'Tarihsiz' }}
                      </RouterLink>
                      <p v-if="s.topics" class="text-ink-soft line-clamp-2">{{ s.topics }}</p>
                    </li>
                  </ul>
                </div>
              </div>
            </BaseDisclosure>
          </li>
        </ol>
      </div>
    </LoadState>
  </BaseCard>
</template>
