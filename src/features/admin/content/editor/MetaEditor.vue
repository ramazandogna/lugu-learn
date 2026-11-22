<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseSelect, BaseSwitch, BaseTextarea, NumberInput } from 'rei-kit'
import type { LessonPackage } from '@/domain/content'
import { CHARACTER_OPTIONS, toLines, useEditor } from './context'

const pkg = defineModel<LessonPackage>({ required: true })
const { newId } = useEditor()

const grammar = computed({ get: () => pkg.value.meta.grammar.join('\n'), set: (s: string) => (pkg.value.meta.grammar = toLines(s)) })
const addObjective = () => pkg.value.meta.objectives.push({ id: newId('', 'objective'), text: '' })
</script>

<template>
  <div class="flex flex-col gap-6">
    <fieldset class="grid gap-3 md:grid-cols-2">
      <legend class="mb-2 font-semibold">Ders kartı</legend>
      <BaseInput v-model="pkg.meta.title" size="sm" label="Başlık (İngilizce)" />
      <BaseInput v-model="pkg.meta.tagline" size="sm" label="Kısa açıklama (Türkçe, öğrenci görür)" />
      <BaseInput v-model="pkg.meta.theme" size="sm" label="Tema" />
      <BaseInput v-model="pkg.meta.level" size="sm" label="Seviye" />
      <BaseSelect v-model="pkg.meta.character" size="sm" label="Ders karakteri" :options="CHARACTER_OPTIONS" />
      <NumberInput v-model="pkg.meta.estimatedMinutes" size="sm" label="Tahmini süre (dk)" :min="5" :max="180" :step="5" decrement-label="Azalt" increment-label="Artır" />
      <BaseTextarea v-model="grammar" class="md:col-span-2" size="sm" label="Dil bilgisi konuları (her satıra bir tane)" :rows="3" />
    </fieldset>

    <fieldset class="flex flex-col gap-2">
      <legend class="mb-2 font-semibold">Hedefler</legend>
      <p class="text-ink-soft text-sm">Kimlik, müfredattaki hedef koduyla aynı olmalı; sorular ve ödev grupları bu kimliğe bağlanır.</p>
      <div v-for="(o, i) in pkg.meta.objectives" :key="i" class="grid items-end gap-2 md:grid-cols-[14rem_1fr_auto]">
        <BaseInput v-model="o.id" size="sm" label="Kimlik" />
        <BaseInput v-model="o.text" size="sm" label="Hedef" />
        <BaseButton size="sm" variant="quiet" icon :aria-label="`${i + 1}. hedefi sil`" @click="pkg.meta.objectives.splice(i, 1)">
          <Trash2 class="size-4" aria-hidden="true" />
        </BaseButton>
      </div>
      <BaseButton class="w-fit" size="sm" variant="secondary" @click="addObjective"><Plus class="size-4" aria-hidden="true" /> Hedef ekle</BaseButton>
    </fieldset>

    <fieldset class="grid gap-3 md:grid-cols-2">
      <legend class="mb-2 font-semibold">Tamamlama kuralları</legend>
      <BaseSwitch v-model="pkg.completion.requireVocabMastery" label="Tüm kelimeler öğrenilmeli" />
      <BaseSwitch v-model="pkg.completion.requireStory" label="Hikâye soruları yanıtlanmalı" />
      <BaseSwitch v-model="pkg.completion.requireHomework" label="Ödev tamamlanmalı" />
      <BaseSwitch v-model="pkg.completion.requireAssessment" label="Değerlendirme gönderilmeli" />
      <NumberInput
        v-model="pkg.completion.minAssessmentPercent"
        size="sm"
        label="En düşük değerlendirme puanı (%)"
        hint="0: göndermek yeterli"
        :min="0"
        :max="100"
        :step="5"
        decrement-label="Azalt"
        increment-label="Artır"
      />
    </fieldset>
  </div>
</template>
