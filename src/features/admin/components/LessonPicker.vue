<script setup lang="ts">
/*
 * Multi-select of a program's lessons ("which lessons are open for this student"). Quick picks for the
 * common cases; each row is a full-width 44px tap target. Optional marks show where the student stands,
 * and the `row` slot adds per-lesson actions (test run, speaking plan).
 */
import { computed } from 'vue'
import { Check, Play } from 'lucide-vue-next'
import { BaseButton } from 'rei-kit'

interface PickLesson {
  id: string
  sequence: number
  title: string
}
const selected = defineModel<string[]>({ required: true })
const {
  lessons,
  completed = new Set<string>(),
  current = null,
  disabled = false,
} = defineProps<{ lessons: readonly PickLesson[]; completed?: ReadonlySet<string>; current?: string | null; disabled?: boolean }>()
defineSlots<{ row?(props: { lesson: PickLesson }): unknown }>()

const set = computed(() => new Set(selected.value))
const ordered = (ids: Iterable<string>) => lessons.filter((l) => new Set(ids).has(l.id)).map((l) => l.id)

function toggle(id: string) {
  const next = new Set(set.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = ordered(next)
}
/** The first lesson after the last open one that is not completed yet: "open the next lesson". */
const nextUp = computed(() => {
  const last = Math.max(0, ...lessons.filter((l) => set.value.has(l.id)).map((l) => l.sequence))
  return lessons.find((l) => l.sequence > last && !completed.has(l.id)) ?? null
})
const allOn = computed(() => lessons.length > 0 && lessons.every((l) => set.value.has(l.id)))
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap gap-2" role="group" aria-label="Hızlı seçim">
      <BaseButton v-if="nextUp" size="sm" variant="secondary" :disabled="disabled" @click="selected = ordered([...set, nextUp.id])">
        + {{ nextUp.sequence }}. dersi de aç
      </BaseButton>
      <BaseButton size="sm" variant="secondary" :disabled="disabled || allOn" @click="selected = lessons.map((l) => l.id)">Tümünü seç</BaseButton>
      <BaseButton size="sm" variant="secondary" :disabled="disabled || !selected.length" @click="selected = []">Seçimi temizle</BaseButton>
    </div>
    <ul class="border-hair rounded-tile divide-hair divide-y border" aria-label="Dersler">
      <li v-for="l in lessons" :key="l.id" class="flex flex-wrap items-center gap-x-3 gap-y-1 pe-2" :class="set.has(l.id) ? 'bg-wash' : ''">
        <label class="focus-within:ring-primary flex min-h-11 min-w-0 flex-[1_1_16rem] cursor-pointer items-center gap-3 px-3 py-2 focus-within:ring-2 focus-within:ring-inset">
          <input type="checkbox" class="accent-primary size-5 shrink-0" :checked="set.has(l.id)" :disabled="disabled" @change="toggle(l.id)" />
          <span class="min-w-0 flex-1">
            <span class="type-body text-ink" :class="set.has(l.id) ? 'font-semibold' : ''">{{ l.sequence }}. {{ l.title }}</span>
            <span v-if="completed.has(l.id) || l.id === current" class="type-small text-ink-soft flex items-center gap-1">
              <Check v-if="completed.has(l.id)" :size="14" aria-hidden="true" />
              <Play v-else :size="14" aria-hidden="true" />
              {{ completed.has(l.id) ? 'Tamamlandı' : 'Öğrenci şu an bu derste' }}
            </span>
          </span>
        </label>
        <slot name="row" :lesson="l" />
      </li>
    </ul>
  </div>
</template>
