<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BaseButton, BaseCard, BaseInput, BaseSwitch, CodeBlock } from 'rei-kit'
import { listSettings, saveSetting } from '@/lib/api/admin'
import type { Json } from '@/lib/database.types'
import LoadState from '../components/LoadState.vue'
import { formatDateTime } from '../lib/format'
import { useAction, useLoad } from '../lib/use-load'

/** Settings the app reads, shown even before a row exists (with the server default). */
const KNOWN: Record<string, { label: string; description: string; fallback: Json }> = {
  'academic.wrong_penalty': { label: 'Yanlış cevap cezası', description: 'Net = doğru − yanlış × bu değer (ör. 0,25 = dört yanlış bir doğruyu götürür).', fallback: 0.25 },
  'rewards.lesson_xp': { label: 'Ders başına XP', description: 'Bir dersin ilk tamamlanmasında verilen puan.', fallback: 100 },
}

const state = useLoad(listSettings)
const { busy, run } = useAction()
const drafts = reactive<Record<string, string | boolean>>({})

const rows = computed(() => {
  const stored = state.data.value ?? []
  const keys = [...new Set([...Object.keys(KNOWN), ...stored.map((s) => s.key)])].sort()
  return keys.map((key) => {
    const row = stored.find((s) => s.key === key)
    return { key, value: row ? row.value : (KNOWN[key]?.fallback ?? null), stored: Boolean(row), updatedAt: row?.updated_at ?? null, description: KNOWN[key]?.description ?? row?.description ?? null }
  })
})

watch(rows, (rs) => {
  for (const r of rs) drafts[r.key] = typeof r.value === 'boolean' ? r.value : typeof r.value === 'number' ? String(r.value).replace('.', ',') : typeof r.value === 'string' ? r.value : ''
})

const kindOf = (v: Json) => (typeof v === 'boolean' ? 'boolean' : typeof v === 'number' ? 'number' : typeof v === 'string' ? 'string' : 'json')
const parsedNumber = (key: string) => Number(String(drafts[key] ?? '').replace(',', '.'))

async function save(key: string, kind: string) {
  const value: Json = kind === 'number' ? parsedNumber(key) : kind === 'boolean' ? Boolean(drafts[key]) : String(drafts[key] ?? '')
  if (kind === 'number' && !Number.isFinite(value as number)) return
  if (await run(() => saveSetting(key, value, KNOWN[key]?.description), 'Ayar kaydedildi')) await state.reload()
}
</script>

<template>
  <LoadState :loading="state.loading.value" :error="state.error.value" @retry="state.reload">
    <div class="flex flex-col gap-3">
      <BaseCard v-for="r in rows" :key="r.key" as="section" :aria-label="KNOWN[r.key]?.label ?? r.key">
        <div class="flex flex-wrap items-end gap-3">
          <div class="min-w-0 flex-1 basis-60">
            <p class="font-semibold">{{ KNOWN[r.key]?.label ?? r.key }}</p>
            <p v-if="r.description" class="text-ink-soft type-small">{{ r.description }}</p>
            <p class="text-ink-soft type-small opacity-80">{{ r.stored ? `Güncelleme ${formatDateTime(r.updatedAt)}` : 'Varsayılan değer' }} · <code class="text-[0.75em]">{{ r.key }}</code></p>
          </div>
          <template v-if="kindOf(r.value) === 'number'">
            <BaseInput
              :model-value="String(drafts[r.key] ?? '')"
              @update:model-value="(v: string) => (drafts[r.key] = v)"
              size="sm"
              inputmode="decimal"
              label="Değer"
              :error="Number.isFinite(parsedNumber(r.key)) ? undefined : 'Sayı girin'"
            />
            <BaseButton class="whitespace-nowrap" :loading="busy" @click="save(r.key, 'number')">Kaydet</BaseButton>
          </template>
          <BaseSwitch v-else-if="kindOf(r.value) === 'boolean'" :model-value="Boolean(drafts[r.key])" label="Etkin" @update:model-value="(v: boolean) => ((drafts[r.key] = v), save(r.key, 'boolean'))" />
          <template v-else-if="kindOf(r.value) === 'string'">
            <BaseInput :model-value="String(drafts[r.key] ?? '')"
              @update:model-value="(v: string) => (drafts[r.key] = v)" size="sm" label="Değer" />
            <BaseButton class="whitespace-nowrap" :loading="busy" @click="save(r.key, 'string')">Kaydet</BaseButton>
          </template>
        </div>
        <CodeBlock v-if="kindOf(r.value) === 'json'" class="mt-2" :code="JSON.stringify(r.value, null, 2)" :label="`${r.key} değeri`" language="json" />
      </BaseCard>
    </div>
  </LoadState>
</template>
