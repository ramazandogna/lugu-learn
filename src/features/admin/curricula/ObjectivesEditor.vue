<script setup lang="ts">
import { reactive, ref } from 'vue'
import { BaseButton, BaseInput, BasePopconfirm, EmptyState } from 'rei-kit'
import { deleteObjective, upsertObjective, type CurriculumObjective, type CurriculumVersion } from '@/lib/api/admin'
import { useAction } from '../lib/use-load'

const { version, objectives } = defineProps<{ version: CurriculumVersion; objectives: readonly CurriculumObjective[] }>()
const emit = defineEmits<{ changed: [] }>()
const { busy, run } = useAction()

const draft = reactive({ code: '', text: '' })
const editingId = ref<string | null>(null)
const edit = reactive({ code: '', text: '' })
const CODE = /^[a-z0-9][a-z0-9-]{0,63}$/

async function add() {
  if (!CODE.test(draft.code) || !draft.text.trim()) return
  const ok = await run(() => upsertObjective(version.id, { code: draft.code, text: draft.text.trim(), sort: objectives.length + 1 }), 'Hedef eklendi')
  if (ok) {
    Object.assign(draft, { code: '', text: '' })
    emit('changed')
  }
}

async function save(o: CurriculumObjective) {
  if (!CODE.test(edit.code) || !edit.text.trim()) return
  if (await run(() => upsertObjective(version.id, { id: o.id, code: edit.code, text: edit.text.trim(), sort: o.sort }), 'Hedef güncellendi')) {
    editingId.value = null
    emit('changed')
  }
}

async function remove(id: string) {
  if (await run(() => deleteObjective(id), 'Hedef silindi')) emit('changed')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-ink-soft type-small">Kod, ders paketindeki hedef kimliği olarak kullanılır (küçük harf, rakam ve tire).</p>
    <EmptyState v-if="!objectives.length" title="Henüz hedef yok" />
    <ul v-else class="divide-hair surface rounded-card divide-y px-4">
      <li v-for="o in objectives" :key="o.id" class="py-3">
        <form v-if="editingId === o.id" class="grid items-end gap-2 md:grid-cols-[12rem_1fr_auto_auto]" @submit.prevent="save(o)">
          <BaseInput v-model="edit.code" size="sm" label="Kod" :error="CODE.test(edit.code) ? undefined : 'Geçersiz kod'" />
          <BaseInput v-model="edit.text" size="sm" label="Hedef" />
          <BaseButton size="sm" type="submit" :loading="busy">Kaydet</BaseButton>
          <BaseButton size="sm" variant="quiet" @click="editingId = null">Vazgeç</BaseButton>
        </form>
        <div v-else class="flex flex-wrap items-center gap-3">
          <code class="text-ink-soft type-small">{{ o.code }}</code>
          <span class="flex-1">{{ o.text }}</span>
          <BaseButton size="sm" variant="quiet" @click="(editingId = o.id), Object.assign(edit, { code: o.code, text: o.text })">Düzenle</BaseButton>
          <BasePopconfirm :message="`${o.code} silinsin mi?`" confirm-label="Sil" cancel-label="Vazgeç" tone="danger" @confirm="remove(o.id)">
            <template #trigger="{ props }"><BaseButton size="sm" variant="quiet" v-bind="props">Sil</BaseButton></template>
          </BasePopconfirm>
        </div>
      </li>
    </ul>
    <form class="surface rounded-card grid items-end gap-2 p-4 md:grid-cols-[12rem_1fr_auto]" @submit.prevent="add">
      <BaseInput
        v-model="draft.code"
        size="sm"
        label="Yeni hedef kodu"
        placeholder="ör. daily-routines"
        :error="draft.code && !CODE.test(draft.code) ? 'Küçük harf, rakam ve tire' : undefined"
      />
      <BaseInput v-model="draft.text" size="sm" label="Hedef" placeholder="Günlük rutinlerini anlatabilir" />
      <BaseButton size="sm" type="submit" :disabled="!CODE.test(draft.code) || !draft.text.trim()" :loading="busy">Ekle</BaseButton>
    </form>
  </div>
</template>
