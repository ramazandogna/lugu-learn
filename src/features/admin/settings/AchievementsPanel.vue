<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseInput, BaseSelect, BaseSwitch, BaseTextarea, NumberInput } from 'rei-kit'
import { DataTable, ResponsiveDialog, type DataColumn } from 'rei-kit/web'
import { listAchievements, saveAchievement, type Achievement } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { useAction, useLoad } from '../lib/use-load'

const state = useLoad(listAchievements)
const { busy, run } = useAction()
const open = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ key: '', title: '', description: '', kind: 'lessons_completed' as Achievement['kind'], threshold: 1 as number | undefined, xp: 0 as number | undefined, active: true, icon: '' })

type Row = { id: string; title: string; kind: string; threshold: number; xp: number; active: boolean; a: Achievement }
const rows = computed<Row[]>(() =>
  (state.data.value ?? []).map((a) => ({ id: a.id, title: a.title, kind: a.kind === 'manual' ? 'Elle verilir' : 'Tamamlanan ders sayısı', threshold: a.threshold ?? 0, xp: a.xp, active: a.active, a })),
)
const columns: DataColumn<Row>[] = [
  { key: 'title', label: 'Başarı', sortable: true },
  { key: 'kind', label: 'Tür' },
  { key: 'threshold', label: 'Eşik', align: 'end', sortable: true },
  { key: 'xp', label: 'XP', align: 'end', sortable: true },
  { key: 'active', label: 'Durum' },
  { key: 'id', label: 'İşlemler', align: 'end' },
]
const kinds = [
  { value: 'lessons_completed' as const, label: 'Tamamlanan ders sayısı' },
  { value: 'manual' as const, label: 'Elle verilir' },
]
const KEY = /^[a-z0-9][a-z0-9_-]{0,63}$/

function edit(a: Achievement | null) {
  editingId.value = a?.id ?? null
  Object.assign(form, {
    key: a?.key ?? '',
    title: a?.title ?? '',
    description: a?.description ?? '',
    kind: a?.kind ?? 'lessons_completed',
    threshold: a?.threshold ?? 1,
    xp: a?.xp ?? 0,
    active: a?.active ?? true,
    icon: a?.icon ?? '',
  })
  open.value = true
}

async function submit() {
  if (!KEY.test(form.key) || !form.title.trim()) return
  const ok = await run(
    () =>
      saveAchievement(editingId.value, {
        key: form.key,
        title: form.title.trim(),
        description: form.description.trim() || null,
        kind: form.kind,
        threshold: form.kind === 'lessons_completed' ? (form.threshold ?? 1) : null,
        xp: form.xp ?? 0,
        active: form.active,
        icon: form.icon.trim() || null,
      }),
    'Başarı kaydedildi',
  )
  if (ok) {
    open.value = false
    await state.reload()
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <BaseButton class="w-fit" @click="edit(null)"><Plus class="size-4" aria-hidden="true" /> Yeni başarı</BaseButton>
    <LoadState :loading="state.loading.value" :error="state.error.value" :empty="!rows.length" empty-title="Başarı tanımı yok" @retry="state.reload">
      <DataTable :columns="columns" :rows="rows" caption="Başarı kataloğu" caption-hidden row-key="id">
        <template #title="{ row }">
          <p class="font-semibold">{{ row.title }}</p>
          <p class="text-ink-soft text-xs">{{ row.a.key }}</p>
        </template>
        <template #threshold="{ row }">{{ row.a.kind === 'manual' ? '—' : row.threshold }}</template>
        <template #active="{ row }"><BaseBadge :tone="row.active ? 'success' : 'neutral'">{{ row.active ? 'Etkin' : 'Pasif' }}</BaseBadge></template>
        <template #id="{ row }"><BaseButton size="sm" variant="quiet" @click="edit(row.a)">Düzenle</BaseButton></template>
      </DataTable>
    </LoadState>
    <ResponsiveDialog v-model="open" :title="editingId ? 'Başarıyı düzenle' : 'Yeni başarı'" close-label="Kapat">
      <form id="achievement-form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
        <BaseInput v-model="form.key" label="Anahtar" :error="form.key && !KEY.test(form.key) ? 'Küçük harf, rakam, - ve _' : undefined" :disabled="Boolean(editingId)" />
        <BaseInput v-model="form.title" label="Başlık (öğrenci görür)" />
        <BaseTextarea v-model="form.description" class="sm:col-span-2" label="Açıklama" :rows="2" />
        <BaseSelect v-model="form.kind" label="Tür" :options="kinds" />
        <NumberInput v-if="form.kind === 'lessons_completed'" v-model="form.threshold" label="Ders sayısı" :min="1" decrement-label="Azalt" increment-label="Artır" />
        <NumberInput v-model="form.xp" label="XP" :min="0" :step="10" decrement-label="Azalt" increment-label="Artır" />
        <BaseInput v-model="form.icon" label="Simge anahtarı (isteğe bağlı)" />
        <BaseSwitch v-model="form.active" label="Etkin" />
      </form>
      <template #actions>
        <BaseButton variant="secondary" @click="open = false">Vazgeç</BaseButton>
        <BaseButton type="submit" form="achievement-form" :loading="busy" :disabled="!KEY.test(form.key) || !form.title.trim()">Kaydet</BaseButton>
      </template>
    </ResponsiveDialog>
  </div>
</template>
