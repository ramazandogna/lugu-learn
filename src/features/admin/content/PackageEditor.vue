<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { BaseAlert, BaseButton, CodeBlock } from 'rei-kit'
import { BaseDisclosure, type TabPanel } from 'rei-kit/web'
import type { LessonPackage } from '@/domain/content'
import { createDraft, saveContent, type PackageRow } from '@/lib/api/admin'
import type { Json } from '@/lib/database.types'
import { toDraft, validatePackage } from '../lib/package-edit'
import { useAction } from '../lib/use-load'
import AssessmentEditor from './editor/AssessmentEditor.vue'
import ExplanationEditor from './editor/ExplanationEditor.vue'
import HomeworkEditor from './editor/HomeworkEditor.vue'
import MetaEditor from './editor/MetaEditor.vue'
import StoryEditor from './editor/StoryEditor.vue'
import VocabularyEditor from './editor/VocabularyEditor.vue'
import { provideEditor } from './editor/context'
import BaseTabs from '../components/ScrollTabs.vue'

/* `pkg` null = a new manual draft for a lesson without content. */
const { pkg, lessonId, lessonTitle, minutes } = defineProps<{ pkg: PackageRow | null; lessonId: string; lessonTitle: string; minutes: number }>()
const emit = defineEmits<{ saved: [row: PackageRow] }>()

const draft = ref<LessonPackage>(toDraft(null, lessonTitle, minutes))
const original = ref('')
function load() {
  draft.value = toDraft(pkg?.content as unknown, lessonTitle, minutes)
  original.value = JSON.stringify(draft.value)
  issues.value = []
}
const issues = ref<string[]>([])
watch(() => pkg?.id, load, { immediate: true })
provideEditor(() => draft.value)

const dirty = computed(() => JSON.stringify(draft.value) !== original.value)
const immutable = computed(() => pkg !== null && pkg.status !== 'draft')
const { busy, run } = useAction()

type Section = 'meta' | 'vocabulary' | 'story' | 'explanation' | 'homework' | 'assessment'
const sections: TabPanel<Section>[] = [
  { key: 'meta', label: 'Genel' },
  { key: 'vocabulary', label: `Kelimeler` },
  { key: 'story', label: 'Hikâye' },
  { key: 'explanation', label: 'Konu anlatımı' },
  { key: 'homework', label: 'Ödev' },
  { key: 'assessment', label: 'Değerlendirme' },
]
const section = ref<Section>('meta')

async function save() {
  const result = validatePackage(draft.value)
  if (!result.ok) {
    issues.value = result.issues
    return
  }
  issues.value = []
  const content = result.value as unknown as Json
  let saved: PackageRow | null = null
  const ok = await run(
    async () => (saved = pkg ? await saveContent(pkg, content) : await createDraft(lessonId, content)),
    immutable.value ? 'Yeni taslak revizyon oluşturuldu' : 'Taslak kaydedildi',
  )
  if (ok && saved) {
    original.value = JSON.stringify(draft.value)
    emit('saved', saved)
  }
}

onBeforeRouteLeave(() => !dirty.value || window.confirm('Kaydedilmemiş değişiklikler var. Sayfadan çıkılsın mı?'))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="surface rounded-card sticky top-16 z-10 flex flex-wrap items-center gap-3 p-3">
      <p class="text-ink-soft flex-1 type-small">
        <template v-if="immutable">Bu revizyon {{ pkg?.status === 'published' ? 'yayında' : 'iş akışında' }}; kaydettiğinizde yeni bir taslak revizyon oluşur.</template>
        <template v-else>Taslak düzenleniyor. Kaydetmeden önce paket doğrulanır.</template>
        <strong v-if="dirty" class="text-ink"> Kaydedilmemiş değişiklikler var.</strong>
      </p>
      <BaseButton variant="secondary" :disabled="!dirty" @click="load">Değişiklikleri at</BaseButton>
      <BaseButton :loading="busy" :disabled="!dirty && pkg !== null" @click="save">{{ immutable ? 'Yeni taslak olarak kaydet' : 'Kaydet' }}</BaseButton>
    </div>

    <BaseAlert v-if="issues.length" tone="danger" assertive>
      <template #title>Paket kaydedilemedi: {{ issues.length }} sorun</template>
      <ul class="list-disc ps-6">
        <li v-for="(x, i) in issues.slice(0, 30)" :key="i">{{ x }}</li>
      </ul>
      <p v-if="issues.length > 30">…ve {{ issues.length - 30 }} sorun daha.</p>
    </BaseAlert>

    <BaseTabs v-model="section" :items="sections" label="Paket bölümleri">
      <template #default="{ active }">
        <div class="surface rounded-card mt-3 p-4">
          <MetaEditor v-if="active === 'meta'" v-model="draft" />
          <VocabularyEditor v-else-if="active === 'vocabulary'" v-model="draft" />
          <StoryEditor v-else-if="active === 'story'" v-model="draft" />
          <ExplanationEditor v-else-if="active === 'explanation'" v-model="draft" />
          <HomeworkEditor v-else-if="active === 'homework'" v-model="draft" />
          <AssessmentEditor v-else v-model="draft" />
        </div>
      </template>
    </BaseTabs>

    <BaseDisclosure title="Ham JSON (salt okunur)" :heading-level="3">
      <CodeBlock :code="JSON.stringify(draft, null, 2)" label="Paketin ham JSON görünümü" language="json" copy-label="Kopyala" copied-label="Kopyalandı" />
    </BaseDisclosure>
  </div>
</template>
