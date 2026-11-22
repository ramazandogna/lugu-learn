<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCard, BaseInput, BasePopconfirm, BaseSwitch } from 'rei-kit'
import { deleteSubject, listSubjects, saveSubject } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useAction, useLoad } from '../lib/use-load'

const state = useLoad(listSubjects)
const { busy, run } = useAction()
const newName = ref('')
const editingId = ref<string | null>(null)
const editName = ref('')

async function add() {
  const name = newName.value.trim()
  if (!name) return
  const sort = (state.data.value?.length ?? 0) + 1
  if (await run(() => saveSubject({ name, sort, active: true }), 'Ders eklendi')) {
    newName.value = ''
    await state.reload()
  }
}

async function update(s: { id: string; name: string; sort: number; active: boolean }) {
  if (await run(() => saveSubject(s), 'Ders güncellendi')) {
    editingId.value = null
    await state.reload()
  }
}

async function remove(id: string) {
  if (await run(() => deleteSubject(id), 'Ders silindi')) await state.reload()
}
</script>

<template>
  <BaseCard as="section" aria-labelledby="subjects-title">
    <template #head>
      <h2 id="subjects-title" class="text-base font-semibold">Dersler</h2>
      <p class="text-ink-soft text-sm">Sonucu girilmiş bir ders silinemez; pasif yapın.</p>
    </template>
    <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
      <ul class="divide-hair divide-y">
        <li v-for="s in state.data.value ?? []" :key="s.id" class="flex flex-wrap items-center gap-2 py-2">
          <form v-if="editingId === s.id" class="flex flex-1 items-end gap-2" @submit.prevent="update({ ...s, name: editName.trim() || s.name })">
            <BaseInput v-model="editName" size="sm" label="Ders adı" label-hidden />
            <BaseButton size="sm" type="submit" :loading="busy">Kaydet</BaseButton>
            <BaseButton size="sm" variant="quiet" @click="editingId = null">Vazgeç</BaseButton>
          </form>
          <template v-else>
            <span class="flex-1 font-semibold" :class="{ 'text-ink-soft': !s.active }">{{ s.name }}</span>
            <BaseSwitch :model-value="s.active" :label="`${s.name} etkin`" label-hidden @update:model-value="(v: boolean) => update({ ...s, active: v })" />
            <BaseButton size="sm" variant="quiet" @click="(editingId = s.id), (editName = s.name)">Düzenle</BaseButton>
            <BasePopconfirm :message="`${s.name} silinsin mi?`" confirm-label="Sil" cancel-label="Vazgeç" tone="danger" @confirm="remove(s.id)">
              <template #trigger="{ props }"><BaseButton size="sm" variant="quiet" v-bind="props">Sil</BaseButton></template>
            </BasePopconfirm>
          </template>
        </li>
        <li v-if="!state.data.value?.length" class="text-ink-soft py-2 text-sm">Henüz ders yok.</li>
      </ul>
      <form class="mt-3 flex items-end gap-2" @submit.prevent="add">
        <BaseInput v-model="newName" class="flex-1" size="sm" label="Yeni ders" placeholder="ör. Matematik" />
        <BaseButton size="sm" type="submit" :disabled="!newName.trim()" :loading="busy">Ekle</BaseButton>
      </form>
    </LoadState>
  </BaseCard>
</template>
