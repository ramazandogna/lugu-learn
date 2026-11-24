<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, BaseCard, BaseInput, BasePopconfirm, BaseSelect, BaseTextarea, EmptyState, FileDrop, useToast } from 'rei-kit'
import {
  addTextSource,
  deleteSource,
  errorMessage,
  sourceKind,
  sourceUrl,
  uploadSource,
  type CurriculumLesson,
  type CurriculumSource,
  type CurriculumVersion,
} from '@/lib/api/admin'
import { formatDate } from '../lib/format'
import { useAction } from '../lib/use-load'

const { curriculumId, version, lessons, sources } = defineProps<{
  curriculumId: string
  version: CurriculumVersion
  lessons: readonly CurriculumLesson[]
  sources: readonly CurriculumSource[]
}>()
const emit = defineEmits<{ changed: [] }>()
const toast = useToast()
const { busy, run } = useAction()

const files = ref<File[]>([])
const lessonId = ref<string | undefined>()
const textTitle = ref('')
const text = ref('')
const lessonOptions = computed(() => lessons.map((l) => ({ value: l.id, label: `${l.sequence}. ${l.title}` })))
const target = () => ({ curriculumId, versionId: version.id, lessonId: lessonId.value ?? null })
const KIND: Record<CurriculumSource['kind'], string> = { text: 'Metin', pdf: 'PDF', image: 'Görsel', document: 'Belge' }
const lessonTitle = (id: string | null) => (id ? (lessons.find((l) => l.id === id)?.title ?? 'Ders') : 'Tüm sürüm')

async function upload() {
  const bad = files.value.filter((f) => !sourceKind(f))
  if (bad.length) return toast.warning(`Desteklenmeyen dosya: ${bad.map((f) => f.name).join(', ')}. Metin, PDF veya görsel yükleyin.`)
  const ok = await run(async () => {
    for (const f of files.value) await uploadSource(target(), f)
  }, 'Kaynaklar yüklendi')
  if (ok) {
    files.value = []
    emit('changed')
  }
}

async function addText() {
  if (!textTitle.value.trim() || !text.value.trim()) return
  if (await run(() => addTextSource(target(), textTitle.value.trim(), text.value), 'Metin kaynağı eklendi')) {
    textTitle.value = ''
    text.value = ''
    emit('changed')
  }
}

async function openSource(s: CurriculumSource) {
  if (!s.storage_path) return
  try {
    window.open(await sourceUrl(s.storage_path), '_blank', 'noopener')
  } catch (e) {
    toast.danger(errorMessage(e))
  }
}

async function remove(s: CurriculumSource) {
  if (await run(() => deleteSource(s), 'Kaynak silindi')) emit('changed')
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <BaseCard as="section" aria-labelledby="src-add">
      <template #head>
        <h2 id="src-add" class="type-body font-semibold">Kaynak ekle</h2>
        <p class="text-ink-soft type-small">AI ders içeriği üretirken bu sürümün ve seçilen dersin kaynaklarını kullanır.</p>
      </template>
      <div class="flex flex-col gap-4">
        <BaseSelect v-model="lessonId" label="Bağlı ders" placeholder="Tüm sürüm" :options="lessonOptions" />
        <FileDrop
          v-model="files"
          label="Dosya yükle"
          hint="Metin, PDF veya görsel; en fazla 20 MB"
          browse-label="Dosya seç"
          remove-label="Kaldır"
          accept="text/plain,text/markdown,application/pdf,image/*"
          multiple
          :max-size="20 * 1024 * 1024"
          too-large-label="Dosya 20 MB sınırını aşıyor"
        />
        <BaseButton class="w-fit" :disabled="!files.length" :loading="busy" @click="upload">Yükle</BaseButton>
        <form class="flex flex-col gap-3" @submit.prevent="addText">
          <BaseInput v-model="textTitle" label="Metin kaynağı başlığı" />
          <BaseTextarea v-model="text" label="Metin" :rows="5" />
          <BaseButton class="w-fit" type="submit" variant="secondary" :disabled="!textTitle.trim() || !text.trim()" :loading="busy">Metni ekle</BaseButton>
        </form>
      </div>
    </BaseCard>
    <BaseCard as="section" aria-labelledby="src-list">
      <template #head><h2 id="src-list" class="type-body font-semibold">Kaynaklar ({{ sources.length }})</h2></template>
      <EmptyState v-if="!sources.length" title="Bu sürüm için kaynak yok" />
      <ul v-else class="divide-hair divide-y">
        <li v-for="s in sources" :key="s.id" class="flex flex-wrap items-center gap-2 py-2 type-small">
          <div class="min-w-40 flex-1">
            <p class="font-semibold">{{ s.title }}</p>
            <p class="text-ink-soft type-small">{{ KIND[s.kind] }} · {{ lessonTitle(s.lesson_id) }} · {{ formatDate(s.created_at) }}</p>
          </div>
          <BaseButton v-if="s.storage_path" size="sm" variant="quiet" @click="openSource(s)">Aç</BaseButton>
          <BasePopconfirm :message="`${s.title} silinsin mi?`" confirm-label="Sil" cancel-label="Vazgeç" tone="danger" @confirm="remove(s)">
            <template #trigger="{ props }"><BaseButton size="sm" variant="quiet" v-bind="props">Sil</BaseButton></template>
          </BasePopconfirm>
        </li>
      </ul>
    </BaseCard>
  </div>
</template>
