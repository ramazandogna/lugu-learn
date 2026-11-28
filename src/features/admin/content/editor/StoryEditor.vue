<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { BaseButton, BaseInput, BaseSelect } from 'rei-kit'
import type { LessonPackage } from '@/domain/content'
import { CHARACTER_OPTIONS, useEditor } from './context'
import QuestionListEditor from './QuestionListEditor.vue'

const pkg = defineModel<LessonPackage>({ required: true })
const { newId } = useEditor()

const speakers = [{ value: 'narrator' as const, label: 'Anlatıcı' }, ...CHARACTER_OPTIONS]
type Scene = LessonPackage['story']['scenes'][number]

const addScene = () => pkg.value.story.scenes.push({ id: newId('', 'scene'), lines: [{ speaker: 'narrator', en: '' }] })
const addLine = (s: Scene) => s.lines.push({ speaker: pkg.value.story.character, en: '' })
const toggleChoice = (s: Scene) =>
  (s.choice = s.choice ? undefined : { prompt: '', options: [{ text: '', feedback: '' }, { text: '', feedback: '' }] })
const optional = (x: string) => x.trim() || undefined
</script>

<template>
  <div class="flex flex-col gap-6">
    <fieldset class="grid gap-3 md:grid-cols-3">
      <legend class="mb-2 font-semibold">Hikâye</legend>
      <BaseInput v-model="pkg.story.title" label="Başlık" />
      <BaseSelect v-model="pkg.story.character" label="Ana karakter" :options="CHARACTER_OPTIONS" />
      <BaseInput v-model="pkg.story.setting" label="Mekân" />
    </fieldset>

    <section class="flex flex-col gap-3" aria-label="Sahneler">
      <h3 class="font-semibold">Sahneler</h3>
      <div v-for="(s, si) in pkg.story.scenes" :key="s.id" class="border-hair rounded-card flex flex-col gap-2 border p-3">
        <div class="flex items-center justify-between">
          <p class="type-small font-semibold">{{ si + 1 }}. sahne <code class="text-ink-soft type-small">{{ s.id }}</code></p>
          <BaseButton variant="quiet" @click="pkg.story.scenes.splice(si, 1)"><Trash2 class="size-4" aria-hidden="true" /> Sahneyi sil</BaseButton>
        </div>
        <div v-for="(l, li) in s.lines" :key="li" class="grid items-end gap-2 md:grid-cols-[10rem_1fr_1fr_auto]">
          <BaseSelect v-model="l.speaker" label="Konuşan" :options="speakers" />
          <BaseInput v-model="l.en" label="Replik (İngilizce)" />
          <BaseInput :model-value="l.tr ?? ''" label="Türkçesi" @update:model-value="(x: string) => (l.tr = optional(x))" />
          <BaseButton variant="quiet" icon :aria-label="`${li + 1}. repliği sil`" :disabled="s.lines.length === 1" @click="s.lines.splice(li, 1)">
            <Trash2 class="size-4" aria-hidden="true" />
          </BaseButton>
        </div>
        <div class="flex flex-wrap gap-2">
          <BaseButton variant="secondary" @click="addLine(s)"><Plus class="size-4" aria-hidden="true" /> Replik</BaseButton>
          <BaseButton variant="quiet" @click="toggleChoice(s)">{{ s.choice ? 'Seçimi kaldır' : 'Hikâye içi seçim ekle' }}</BaseButton>
        </div>
        <div v-if="s.choice" class="bg-muted rounded-card flex flex-col gap-2 p-3">
          <BaseInput v-model="s.choice.prompt" label="Seçim sorusu (puanlanmaz)" />
          <div v-for="(o, oi) in s.choice.options" :key="oi" class="grid items-end gap-2 md:grid-cols-[1fr_1fr_auto]">
            <BaseInput v-model="o.text" :label="`${oi + 1}. seçenek`" />
            <BaseInput v-model="o.feedback" label="Geri bildirim" />
            <BaseButton variant="quiet" icon :aria-label="`${oi + 1}. seçeneği sil`" :disabled="s.choice.options.length <= 2" @click="s.choice.options.splice(oi, 1)">
              <Trash2 class="size-4" aria-hidden="true" />
            </BaseButton>
          </div>
          <BaseButton v-if="s.choice.options.length < 4" class="w-fit" variant="secondary" @click="s.choice.options.push({ text: '', feedback: '' })">
            <Plus class="size-4" aria-hidden="true" /> Seçenek
          </BaseButton>
        </div>
      </div>
      <BaseButton class="w-fit" variant="secondary" @click="addScene"><Plus class="size-4" aria-hidden="true" /> Sahne ekle</BaseButton>
    </section>

    <section class="flex flex-col gap-2" aria-label="Okuma soruları">
      <h3 class="font-semibold">Anlama soruları</h3>
      <QuestionListEditor v-model="pkg.story.questions" prefix="story-q" label="Soru ekle" />
    </section>
  </div>
</template>
