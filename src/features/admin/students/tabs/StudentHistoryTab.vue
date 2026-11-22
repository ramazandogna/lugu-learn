<script setup lang="ts">
import { computed } from 'vue'
import { BaseBadge, BaseTable, EmptyState } from 'rei-kit'
import { BaseDisclosure } from 'rei-kit/web'
import type { LearningData } from '@/lib/api/admin'
import { SECTION_KEYS } from '@/domain/content'
import { SESSION_EVENT_LABEL, SESSION_STATUS, formatDateTime, formatDuration, sectionLabel } from '../../lib/format'

const { data } = defineProps<{ data: LearningData }>()

const sessions = computed(() =>
  data.sessions.map((s) => {
    const sections = data.sections
      .filter((x) => x.session_id === s.id)
      .sort((a, b) => SECTION_KEYS.indexOf(a.section) - SECTION_KEYS.indexOf(b.section))
      .map((x) => ({
        id: x.id,
        section: sectionLabel(x.section),
        status: x.status === 'completed' ? 'Tamamlandı' : x.status === 'in_progress' ? 'Devam ediyor' : 'Başlanmadı',
        active: formatDuration(x.active_seconds),
        answers: x.attempts_count ? `${x.correct_count}/${x.attempts_count} doğru` : '—',
        completed: formatDateTime(x.completed_at),
      }))
    const attempts = data.attempts.filter((a) => a.session_id === s.id)
    const breaks = data.breaks.filter((b) => b.session_id === s.id)
    const events = data.events.filter((e) => e.session_id === s.id)
    const eventCounts = new Map<string, number>()
    for (const e of events) eventCounts.set(e.kind, (eventCounts.get(e.kind) ?? 0) + 1)
    return {
      session: s,
      title: `${formatDateTime(s.started_at)} · ${data.lessons.get(s.lesson_id)?.title ?? 'Ders'}`,
      sections,
      attempts: attempts.length,
      correct: attempts.filter((a) => a.correct).length,
      breaks,
      eventSummary: [...eventCounts].map(([k, n]) => `${SESSION_EVENT_LABEL[k as keyof typeof SESSION_EVENT_LABEL] ?? k}: ${n}`),
    }
  }),
)
</script>

<template>
  <EmptyState v-if="!sessions.length" title="Henüz oturum yok" description="Öğrenci bir derse başladığında oturumlar burada listelenir." />
  <ul v-else class="flex flex-col gap-2">
    <li v-for="x in sessions" :key="x.session.id" class="surface rounded-card px-4 py-2">
      <BaseDisclosure :heading-level="3">
        <template #title>
          <span class="flex flex-wrap items-center gap-2">
            <span class="font-semibold">{{ x.title }}</span>
            <BaseBadge v-if="x.session.kind === 'replay'" tone="primary">Tekrar</BaseBadge>
            <BaseBadge :tone="x.session.status === 'completed' ? 'success' : x.session.status === 'abandoned' ? 'warning' : 'neutral'">
              {{ SESSION_STATUS[x.session.status] }}
            </BaseBadge>
          </span>
        </template>
        <div class="flex flex-col gap-3 py-2 text-sm">
          <p class="text-ink-soft">
            Etkin {{ formatDuration(x.session.active_seconds) }} · hareketsiz {{ formatDuration(x.session.idle_seconds) }} · mola
            {{ formatDuration(x.session.break_seconds) }} · {{ x.correct }}/{{ x.attempts }} doğru yanıt · son görülme
            {{ formatDateTime(x.session.last_seen_at) }}
          </p>
          <BaseTable
            caption="Bölümler"
            row-key="id"
            :rows="x.sections"
            :columns="[
              { key: 'section', label: 'Bölüm' },
              { key: 'status', label: 'Durum' },
              { key: 'active', label: 'Etkin süre', align: 'end' },
              { key: 'answers', label: 'Yanıtlar', align: 'end' },
              { key: 'completed', label: 'Bitiş', nowrap: true },
            ]"
          />
          <div v-if="x.breaks.length">
            <h4 class="font-semibold">Molalar</h4>
            <ul class="text-ink-soft list-disc ps-5">
              <li v-for="b in x.breaks" :key="b.id">
                {{ sectionLabel(b.after_section) }} sonrası, {{ b.planned_minutes ? `${b.planned_minutes} dk planlandı` : 'süresiz' }}
                <template v-if="b.ended_at"> · {{ formatDuration((Date.parse(b.ended_at) - Date.parse(b.started_at)) / 1000) }} sürdü</template>
                <template v-if="b.early_return"> · erken döndü</template>
              </li>
            </ul>
          </div>
          <p v-if="x.eventSummary.length" class="text-ink-soft">Odak olayları: {{ x.eventSummary.join(' · ') }}</p>
        </div>
      </BaseDisclosure>
    </li>
  </ul>
</template>
