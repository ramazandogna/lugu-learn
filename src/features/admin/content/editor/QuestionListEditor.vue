<script setup lang="ts">
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-vue-next'
import { BaseButton } from 'rei-kit'
import { BaseDisclosure } from 'rei-kit/web'
import type { Question } from '@/domain/content'
import { blankQuestion, moveItem, type QuestionType } from '../../lib/package-edit'
import { useEditor } from './context'
import QuestionEditor from './QuestionEditor.vue'

const list = defineModel<Question[]>({ required: true })
const { prefix, label, types, noHints = false, defaultType = 'choice' } = defineProps<{
  prefix: string
  label: string
  types?: readonly QuestionType[]
  noHints?: boolean
  defaultType?: QuestionType
}>()
const { newId } = useEditor()

const add = () => (list.value = [...list.value, blankQuestion(defaultType, newId('', prefix))])
const remove = (i: number) => (list.value = list.value.filter((_, j) => j !== i))
const move = (i: number, d: number) => (list.value = moveItem(list.value, i, i + d))
</script>

<template>
  <div class="flex flex-col gap-2">
    <ol class="flex flex-col gap-2">
      <li v-for="(q, i) in list" :key="q.id" class="border-hair rounded-card border px-3 py-1">
        <BaseDisclosure :heading-level="4">
          <template #title>
            <span class="text-sm">{{ i + 1 }}. {{ q.prompt || 'Yeni soru' }}</span>
          </template>
          <div class="flex flex-col gap-3 py-2">
            <QuestionEditor :model-value="q" :types="types" :no-hints="noHints" @update:model-value="(v: Question) => (list[i] = v)" />
            <div class="flex gap-1">
              <BaseButton size="xs" variant="quiet" :disabled="i === 0" @click="move(i, -1)"><ArrowUp class="size-4" aria-hidden="true" /> Yukarı</BaseButton>
              <BaseButton size="xs" variant="quiet" :disabled="i === list.length - 1" @click="move(i, 1)"><ArrowDown class="size-4" aria-hidden="true" /> Aşağı</BaseButton>
              <BaseButton size="xs" variant="quiet" @click="remove(i)"><Trash2 class="size-4" aria-hidden="true" /> Sil</BaseButton>
            </div>
          </div>
        </BaseDisclosure>
      </li>
    </ol>
    <BaseButton class="w-fit" size="sm" variant="secondary" @click="add"><Plus class="size-4" aria-hidden="true" /> {{ label }}</BaseButton>
  </div>
</template>
