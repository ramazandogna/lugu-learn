<script setup lang="ts">
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseSelect } from 'rei-kit'
import type { LessonPackage } from '@/domain/content'
import { moveItem } from '../../lib/package-edit'
import { useEditor } from './context'

const pkg = defineModel<LessonPackage>({ required: true })
const { newId, objectiveOptions } = useEditor()

const difficulty = [
  { value: 1, label: '1 · kolay' },
  { value: 2, label: '2 · orta' },
  { value: 3, label: '3 · zor' },
]

function add() {
  pkg.value.vocabulary.push({ id: newId('', 'word'), en: '', tr: '', example: { en: '', tr: '' }, difficulty: 1 })
}
function syncId(i: number) {
  const v = pkg.value.vocabulary[i]
  // Ids are minted from the phrase until the item is used anywhere else (a fresh `word-n` id).
  if (v && /^word(-\d+)?$/.test(v.id) && v.en.trim()) v.id = newId(v.en, 'word')
}
const move = (i: number, d: number) => (pkg.value.vocabulary = moveItem(pkg.value.vocabulary, i, i + d))
const optional = (s: string) => s.trim() || undefined
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-ink-soft text-sm">{{ pkg.vocabulary.length }} öğe (önerilen 10–20). Tek kelime yerine kalıp tercih edin: “have breakfast”.</p>
    <ol class="flex flex-col gap-3">
      <li v-for="(v, i) in pkg.vocabulary" :key="i" class="border-hair rounded-card grid gap-2 border p-3 md:grid-cols-4">
        <p class="text-ink-soft text-xs md:col-span-4">{{ i + 1 }}. · kimlik <code>{{ v.id }}</code></p>
        <BaseInput v-model="v.en" size="sm" label="İngilizce" @blur="syncId(i)" />
        <BaseInput v-model="v.tr" size="sm" label="Türkçe" />
        <BaseSelect v-model="v.difficulty" size="sm" label="Zorluk" :options="difficulty" />
        <BaseSelect
          :model-value="v.objectiveId"
          size="sm"
          label="Hedef"
          placeholder="Yok"
          :options="objectiveOptions"
          @update:model-value="(x: string | undefined) => (v.objectiveId = x || undefined)"
        />
        <BaseInput v-model="v.example.en" class="md:col-span-2" size="sm" label="Örnek cümle (İngilizce)" />
        <BaseInput v-model="v.example.tr" class="md:col-span-2" size="sm" label="Örnek cümle (Türkçe)" />
        <BaseInput
          :model-value="v.context ?? ''"
          class="md:col-span-3"
          size="sm"
          label="Kullanım notu (Türkçe, isteğe bağlı)"
          @update:model-value="(x: string) => (v.context = optional(x))"
        />
        <div class="flex items-end gap-1">
          <BaseButton size="sm" variant="quiet" icon :aria-label="`${v.en || i + 1} yukarı`" :disabled="i === 0" @click="move(i, -1)"><ArrowUp class="size-4" aria-hidden="true" /></BaseButton>
          <BaseButton size="sm" variant="quiet" icon :aria-label="`${v.en || i + 1} aşağı`" :disabled="i === pkg.vocabulary.length - 1" @click="move(i, 1)">
            <ArrowDown class="size-4" aria-hidden="true" />
          </BaseButton>
          <BaseButton size="sm" variant="quiet" icon :aria-label="`${v.en || i + 1} sil`" @click="pkg.vocabulary.splice(i, 1)"><Trash2 class="size-4" aria-hidden="true" /></BaseButton>
        </div>
      </li>
    </ol>
    <BaseButton class="w-fit" size="sm" variant="secondary" @click="add"><Plus class="size-4" aria-hidden="true" /> Kelime ekle</BaseButton>
  </div>
</template>
