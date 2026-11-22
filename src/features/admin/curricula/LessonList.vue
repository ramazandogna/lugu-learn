<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowDown, ArrowUp, Plus } from 'lucide-vue-next'
import { BaseAlert, BaseBadge, BaseButton, BasePopconfirm, EmptyState, announce } from 'rei-kit'
import { deleteLesson, reorderLessons, type CurriculumLesson, type CurriculumObjective, type CurriculumVersion } from '@/lib/api/admin'
import { moveItem } from '../lib/package-edit'
import { useAction } from '../lib/use-load'
import LessonDialog from './LessonDialog.vue'

const { version, lessons, objectives } = defineProps<{ version: CurriculumVersion; lessons: readonly CurriculumLesson[]; objectives: readonly CurriculumObjective[] }>()
const emit = defineEmits<{ changed: [] }>()

const order = ref<CurriculumLesson[]>([])
watch(() => lessons, (ls) => (order.value = [...ls]), { immediate: true })
const dirty = computed(() => order.value.some((l, i) => l.id !== lessons[i]?.id))
const locked = computed(() => version.status !== 'draft')
const editing = ref<CurriculumLesson | null>(null)
const dialog = ref(false)
const { busy, run } = useAction()

const STATUS: Record<CurriculumLesson['status'], string> = { draft: 'Taslak', ready: 'Hazır', archived: 'Arşiv' }
const titleOf = (id: string) => lessons.find((l) => l.id === id)?.title ?? '—'

function move(i: number, delta: number) {
  order.value = moveItem(order.value, i, i + delta)
  const l = order.value[i + delta]
  if (l) announce(`${l.title}, ${i + delta + 1}. sıraya taşındı`)
}

async function saveOrder() {
  const max = Math.max(0, ...lessons.map((l) => l.sequence))
  if (await run(() => reorderLessons(order.value.map((l) => l.id), max), 'Ders sırası kaydedildi')) emit('changed')
}

function edit(l: CurriculumLesson | null) {
  editing.value = l
  dialog.value = true
}

async function remove(id: string) {
  if (await run(() => deleteLesson(id), 'Ders silindi')) emit('changed')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <BaseAlert v-if="locked" tone="info">Bu sürüm yayınlandı: ders eklenemez, silinemez, sırası değişmez. Başlık, süre ve hedefleri düzenleyebilirsiniz.</BaseAlert>
    <div class="flex flex-wrap items-center gap-2">
      <BaseButton v-if="!locked" size="sm" @click="edit(null)"><Plus class="size-4" aria-hidden="true" /> Ders ekle</BaseButton>
      <template v-if="dirty">
        <BaseButton size="sm" :loading="busy" @click="saveOrder">Sırayı kaydet</BaseButton>
        <BaseButton size="sm" variant="quiet" @click="order = [...lessons]">Sırayı geri al</BaseButton>
      </template>
    </div>
    <EmptyState v-if="!order.length" title="Bu sürümde henüz ders yok" />
    <ol v-else class="flex flex-col gap-2" aria-label="Dersler, sırasıyla">
      <li v-for="(l, i) in order" :key="l.id" class="surface rounded-card flex flex-wrap items-center gap-3 p-3">
        <div v-if="!locked" class="flex flex-col">
          <BaseButton size="xs" variant="quiet" icon :aria-label="`${l.title} yukarı taşı`" :disabled="i === 0" @click="move(i, -1)">
            <ArrowUp class="size-4" aria-hidden="true" />
          </BaseButton>
          <BaseButton size="xs" variant="quiet" icon :aria-label="`${l.title} aşağı taşı`" :disabled="i === order.length - 1" @click="move(i, 1)">
            <ArrowDown class="size-4" aria-hidden="true" />
          </BaseButton>
        </div>
        <span class="text-ink-soft w-8 text-end font-semibold tabular-nums">{{ i + 1 }}.</span>
        <div class="min-w-48 flex-1">
          <p class="font-semibold">{{ l.title }}</p>
          <p class="text-ink-soft text-xs">
            {{ l.estimated_minutes }} dk · {{ l.objective_ids.length }} hedef
            <template v-if="l.prerequisite_ids.length"> · ön koşul: {{ l.prerequisite_ids.map(titleOf).join(', ') }}</template>
          </p>
        </div>
        <BaseBadge :tone="l.status === 'ready' ? 'success' : 'neutral'">{{ STATUS[l.status] }}</BaseBadge>
        <BaseButton as="router-link" size="sm" variant="secondary" :to="{ name: 'admin-lesson', params: { lessonId: l.id } }">İçerik</BaseButton>
        <BaseButton size="sm" variant="quiet" @click="edit(l)">Düzenle</BaseButton>
        <BasePopconfirm v-if="!locked" :message="`${l.title} silinsin mi?`" confirm-label="Sil" cancel-label="Vazgeç" tone="danger" @confirm="remove(l.id)">
          <template #trigger="{ props }"><BaseButton size="sm" variant="quiet" v-bind="props">Sil</BaseButton></template>
        </BasePopconfirm>
      </li>
    </ol>
    <LessonDialog
      v-model="dialog"
      :version-id="version.id"
      :lesson="editing"
      :lessons="lessons"
      :objectives="objectives"
      :next-sequence="Math.max(0, ...lessons.map((l) => l.sequence)) + 1"
      @saved="emit('changed')"
    />
  </div>
</template>
