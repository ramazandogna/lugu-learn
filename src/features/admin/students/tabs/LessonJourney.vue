<script setup lang="ts">
/*
 * The student's way through their programs, one row per lesson: what the lesson teaches (its objectives),
 * how it went (stars, score, time, words, accuracy) and the speaking sessions held on it (how many, which
 * targets were reached, what was talked about). Answers "what have we covered, and what did it bring?".
 */
import { computed, ref } from 'vue'
import { Check, Lock, Play } from 'lucide-vue-next'
import { BaseBadge, BaseCard, BaseSwitch } from 'rei-kit'
import { listAssignments, listSpeakingSessions, noteTargets, speakingNotesFor, type LearningData } from '@/lib/api/admin'
import LoadState from '../../components/LoadState.vue'
import { formatDate, sectionLabel } from '../../lib/format'
import {
  LEVEL_ICON,
  LEVEL_TONE,
  accuracyLevel,
  compareAttempts,
  hintLevel,
  learned,
  scoreLevel,
  struggles,
  teacherSentence,
  timeLevel,
} from '../../lib/insights'
import { mergedLabels } from '../../lib/package-labels'
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

const labels = computed(() => mergedLabels([...data.packages.values()].map((p) => p.content)))
const sessionById = computed(() => new Map(data.sessions.map((s) => [s.id, s])))

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
        const summary = (completion?.summary ?? {}) as { assessment_percent?: number | null }
        const pkgIds = new Set([...data.packages].filter(([, p]) => p.lessonId === l.id).map(([id]) => id))
        const words = data.mastery.filter((m) => pkgIds.has(m.package_id))
        const content = [...data.packages.values()].find((p) => p.lessonId === l.id)?.content as { meta?: { objectives?: { text: string }[] } } | undefined
        const talks = d.speaking.filter((s) => s.lesson_id === l.id)
        const talkNotes = d.notes.filter((n) => talks.some((s) => s.id === n.speaking_session_id))
        const targets = talkNotes.flatMap((n) => noteTargets(n))

        const results = data.assessments
          .filter((a) => lessonOfSession.get(a.session_id) === l.id)
          .sort((x, y) => x.submitted_at.localeCompare(y.submitted_at))
        const last = results.at(-1)
        const prev = results.at(-2)
        const snap = (r: typeof last) => ({ percent: r ? r.percent : null, activeSec: r ? (sessionById.value.get(r.session_id)?.active_seconds ?? null) : null })
        const lessonAttempts = data.attempts.filter((x) => lessonOfSession.get(x.session_id) === l.id)
        const used = (last ? lessonAttempts.filter((x) => x.session_id === last.session_id) : lessonAttempts).map((x) => ({
          section: x.section,
          attemptNo: x.attempt_no,
          correct: x.correct,
          hintUsed: x.hint_used,
        }))
        const percent = last ? last.percent : (summary.assessment_percent ?? null)
        const score = scoreLevel(percent)
        const accuracy = accuracyLevel(used)
        const time = timeLevel(last ? snap(last).activeSec : null, data.lessons.get(l.id)?.estimatedMinutes)
        const hint = hintLevel(used)
        const comparison = compareAttempts(prev ? snap(prev) : null, snap(last))
        const hard = struggles({
          attempts: used,
          vocab: words.map((m) => ({ label: labels.value.vocab.get(m.item_id) ?? m.item_id, incorrectCount: m.incorrect_count, mastered: !!m.mastered_at })),
        })
        const got = learned({
          masteredWords: words.filter((m) => m.mastered_at).map((m) => labels.value.vocab.get(m.item_id) ?? m.item_id),
          metTargets: targets.filter((t) => t.result === 'met').map((t) => t.text),
          objectives: content?.meta?.objectives?.map((o) => o.text) ?? [],
        })
        const sectionName = hard.section ? sectionLabel(hard.section as never) : null
        const sentence = last || used.length ? teacherSentence({ percent, hint, time, comparison, sectionName, words: hard.words }) : null
        const indicators = [
          { key: 'score', title: 'Puan', ind: score },
          { key: 'acc', title: 'İlk deneme', ind: accuracy },
          { key: 'time', title: 'Süre', ind: time },
          { key: 'hint', title: 'İpucu', ind: hint },
        ]
        return {
          lesson: l,
          mark,
          completedAt: completion?.completed_at ?? null,
          indicators,
          comparison: last ? comparison : null,
          sentence,
          hard: { section: sectionName, percent: hard.sectionPercent, words: hard.words },
          got,
          talks: talks.length,
          touched: done || mark === 'current' || used.length > 0 || talks.length > 0,
        }
      })
    return { id: a.assignment.id, name: a.curriculumName, lessons }
  })
})
const visible = (rows: (typeof programs.value)[number]['lessons']) => (showAll.value ? rows : rows.filter((r) => r.touched))
const talksTotal = computed(() => state.data.value?.speaking.filter((s) => s.status === 'ended').length ?? 0)
</script>

<template>
  <BaseCard as="section" aria-labelledby="journey-title">
    <template #head>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="journey-title" class="type-body font-semibold">Ders geçmişi</h2>
          <p v-if="talksTotal" class="text-ink-soft type-small">{{ talksTotal }} konuşma oturumu yapıldı.</p>
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
            <ul v-if="r.indicators.some((i) => i.ind.level !== 'yok')" class="mt-2 flex flex-wrap gap-2">
              <li v-for="i in r.indicators" :key="i.key">
                <BaseBadge :tone="LEVEL_TONE[i.ind.level]">
                  <component :is="LEVEL_ICON[i.ind.level]" :size="12" class="me-1 inline" aria-hidden="true" />{{ i.title }} {{ i.ind.value }} · {{ i.ind.label }}
                </BaseBadge>
              </li>
            </ul>
            <p v-else class="type-small text-ink-soft mt-2">Henüz ölçülecek veri yok.</p>
            <p v-if="r.comparison" class="type-small text-ink-soft mt-1">{{ r.comparison.text }}<template v-if="r.completedAt"> · {{ formatDate(r.completedAt) }}</template></p>
            <p v-if="r.sentence" class="type-small text-ink mt-2"><span class="font-semibold">Öğretmen notu:</span> {{ r.sentence }}</p>
            <p v-if="r.hard.section || r.hard.words.length" class="type-small mt-1">
              <span class="text-warning-ink font-semibold">Zorlandığı yerler:</span>
              <span class="text-ink-soft">
                <template v-if="r.hard.section"> {{ r.hard.section }} (ilk deneme %{{ r.hard.percent }})</template><template v-if="r.hard.section && r.hard.words.length"> · </template><template v-if="r.hard.words.length"> kelimeler: {{ r.hard.words.join(', ') }}</template>
              </span>
            </p>
            <p v-if="r.got.words.length || r.got.targets.length || r.got.objectives.length" class="type-small mt-1">
              <span class="text-positive font-semibold">Öğrendikleri:</span>
              <span class="text-ink-soft">
                {{ [r.got.words.length ? `${r.got.words.length} kelime (${r.got.words.slice(0, 5).join(', ')}${r.got.words.length > 5 ? '…' : ''})` : null, r.got.targets.length ? `konuşma hedefi: ${r.got.targets.join('; ')}` : null, r.got.objectives.length ? `kazanım: ${r.got.objectives.join('; ')}` : null].filter(Boolean).join(' · ') }}
              </span>
            </p>
          </li>
        </ol>
      </div>
    </LoadState>
  </BaseCard>
</template>
