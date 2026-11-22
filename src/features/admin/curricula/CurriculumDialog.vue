<script setup lang="ts">
import { reactive, watch } from 'vue'
import { BaseButton, BaseInput, BaseSelect, BaseTextarea, NumberInput } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { createCurriculum, updateCurriculum, type Curriculum } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'

const open = defineModel<boolean>({ default: false })
const { curriculum = null } = defineProps<{ curriculum?: Curriculum | null }>()
const emit = defineEmits<{ saved: [id: string] }>()

const form = reactive({ name: '', description: '', grade: undefined as number | undefined, target_level: '', kind: 'standard' as Curriculum['kind'] })
const { busy, run } = useAction()

watch(open, (v) => {
  if (v)
    Object.assign(form, {
      name: curriculum?.name ?? '',
      description: curriculum?.description ?? '',
      grade: curriculum?.grade ?? undefined,
      target_level: curriculum?.target_level ?? '',
      kind: curriculum?.kind ?? 'standard',
    })
})

const kinds = [
  { value: 'standard' as const, label: 'Standart' },
  { value: 'exam_prep' as const, label: 'Sınava hazırlık' },
  { value: 'remedial' as const, label: 'Telafi' },
  { value: 'custom' as const, label: 'Özel' },
]

async function submit() {
  if (!form.name.trim()) return
  const input = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    grade: form.grade ?? null,
    target_level: form.target_level.trim() || null,
    kind: form.kind,
  }
  let id = curriculum?.id ?? ''
  const ok = await run(async () => {
    if (curriculum) await updateCurriculum(curriculum.id, input)
    else id = (await createCurriculum(input)).id
  }, 'Müfredat kaydedildi')
  if (ok) {
    open.value = false
    emit('saved', id)
  }
}
</script>

<template>
  <ResponsiveDialog v-model="open" :title="curriculum ? 'Müfredatı düzenle' : 'Yeni müfredat'" close-label="Kapat">
    <form id="curriculum-form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
      <BaseInput v-model="form.name" class="sm:col-span-2" label="Ad" :error="form.name.trim() ? undefined : 'Gerekli'" />
      <BaseTextarea v-model="form.description" class="sm:col-span-2" label="Açıklama" :rows="3" />
      <NumberInput v-model="form.grade" label="Sınıf" :min="1" :max="12" decrement-label="Azalt" increment-label="Artır" />
      <BaseInput v-model="form.target_level" label="Hedef seviye" placeholder="ör. A1, A2" />
      <BaseSelect v-model="form.kind" label="Tür" :options="kinds" />
    </form>
    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
      <BaseButton type="submit" form="curriculum-form" :loading="busy" :disabled="!form.name.trim()">Kaydet</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
