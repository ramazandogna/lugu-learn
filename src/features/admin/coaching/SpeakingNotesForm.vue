<script setup lang="ts">
/*
 * The record of one speaking session: what we aimed for and how each aim went, what we talked about,
 * and the teacher's observations. Read back on the student's statistics ("we spoke N times about this lesson").
 */
import { reactive, ref, watch } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { BaseButton, BaseCard, BaseInput, BaseTextarea } from 'rei-kit'
import { noteTargets, saveSpeakingNote, type SpeakingNote, type SpeakingTarget, type TargetResult } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'

const { sessionId, note, suggestions = [] } = defineProps<{ sessionId: string; note: SpeakingNote | null; suggestions?: readonly string[] }>()
const emit = defineEmits<{ saved: [] }>()
const form = reactive({ observations: '', strengths: '', goals: '', follow_up: '', topics: '' })
const targets = ref<SpeakingTarget[]>([])
const { busy, run } = useAction()

watch(
  () => note,
  (n) => {
    Object.assign(form, { observations: n?.observations ?? '', strengths: n?.strengths ?? '', goals: n?.goals ?? '', follow_up: n?.follow_up ?? '', topics: n?.topics ?? '' })
    targets.value = noteTargets(n)
  },
  { immediate: true },
)

const RESULTS: { value: TargetResult; label: string; on: string }[] = [
  { value: 'met', label: 'Kazanıldı', on: 'bg-positive text-on-primary border-positive' },
  { value: 'partly', label: 'Kısmen', on: 'bg-warning text-ink border-warning' },
  { value: 'not', label: 'Henüz değil', on: 'bg-negative text-on-primary border-negative' },
]
function addSuggestions() {
  const have = new Set(targets.value.map((t) => t.text.trim()))
  targets.value = [...targets.value, ...suggestions.filter((s) => !have.has(s.trim())).map((text) => ({ text, result: null }))]
}

const t = (s: string) => s.trim() || null
async function save() {
  const ok = await run(
    () =>
      saveSpeakingNote(sessionId, note?.id ?? null, {
        observations: t(form.observations),
        strengths: t(form.strengths),
        goals: t(form.goals),
        follow_up: t(form.follow_up),
        topics: t(form.topics),
        targets: targets.value.filter((x) => x.text.trim()).map((x) => ({ text: x.text.trim(), result: x.result })),
      }),
    'Oturum kaydı kaydedildi',
  )
  if (ok) emit('saved')
}
</script>

<template>
  <BaseCard as="section" aria-labelledby="sp-notes">
    <template #head>
      <h2 id="sp-notes" class="type-body font-semibold">Oturum kaydı</h2>
      <p class="text-ink-soft type-small">Neyi hedefledik, neyi kazandık, neler konuştuk. Öğrencinin İlerleme sekmesinde derse göre listelenir.</p>
    </template>
    <form class="flex flex-col gap-5" @submit.prevent="save">
      <fieldset class="flex flex-col gap-3">
        <legend class="type-body mb-2 font-semibold">Hedefler ve sonuç</legend>
        <p v-if="!targets.length" class="text-ink-soft type-small">Henüz hedef yok. Dersin hedeflerinden ekleyin ya da kendiniz yazın.</p>
        <div v-for="(x, i) in targets" :key="i" class="border-hair rounded-tile flex flex-col gap-2 border p-3">
          <div class="flex items-end gap-2">
            <BaseInput v-model="x.text" class="min-w-0 flex-1" :label="`Hedef ${i + 1}`" autocomplete="off" />
            <BaseButton variant="quiet" icon :aria-label="`Hedef ${i + 1}: kaldır`" @click="targets.splice(i, 1)"><X :size="18" aria-hidden="true" /></BaseButton>
          </div>
          <div class="flex flex-wrap gap-2" role="radiogroup" :aria-label="`Hedef ${i + 1} sonucu`">
            <button
              v-for="r in RESULTS"
              :key="r.value"
              type="button"
              role="radio"
              :aria-checked="x.result === r.value"
              class="focus-ring rounded-control type-small min-h-10 border px-3 font-semibold"
              :class="x.result === r.value ? r.on : 'border-hair text-ink-soft hover:bg-muted'"
              @click="x.result = x.result === r.value ? null : r.value"
            >
              {{ r.label }}
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <BaseButton size="sm" variant="secondary" @click="targets.push({ text: '', result: null })"><Plus :size="16" aria-hidden="true" /> Hedef ekle</BaseButton>
          <BaseButton v-if="suggestions.length" size="sm" variant="secondary" @click="addSuggestions">Dersin hedeflerinden ekle ({{ suggestions.length }})</BaseButton>
        </div>
      </fieldset>
      <BaseTextarea v-model="form.topics" label="Neler konuştuk?" hint="Konular, sorular, öğrencinin kurduğu cümleler" :rows="5" />
      <div class="grid gap-4 md:grid-cols-2">
        <BaseTextarea v-model="form.observations" label="Gözlemler" :rows="3" />
        <BaseTextarea v-model="form.strengths" label="Güçlü yönler" :rows="3" />
        <BaseTextarea v-model="form.goals" label="Uzun vadeli hedefler" :rows="3" />
        <BaseTextarea v-model="form.follow_up" label="Sonraki oturumda" hint="Bir sonraki oturumda neye bakılacak" :rows="3" />
      </div>
      <BaseButton class="w-fit" type="submit" :loading="busy">Kaydı kaydet</BaseButton>
    </form>
  </BaseCard>
</template>
