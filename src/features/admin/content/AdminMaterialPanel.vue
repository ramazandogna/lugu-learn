<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseAlert, BaseButton, BaseCard, EmptyState } from 'rei-kit'
import { SpeakingPlan, TeacherGuide } from '@/domain/content'
import { saveAdminMaterial, type AdminMaterialRow } from '@/lib/api/admin'
import type { Json } from '@/lib/database.types'
import SpeakingPlanBlocks from '../coaching/SpeakingPlanBlocks.vue'
import { useAction } from '../lib/use-load'
import SpeakingPlanForm from './SpeakingPlanForm.vue'
import TeacherGuideForm from './TeacherGuideForm.vue'
import TeacherGuideView from './TeacherGuideView.vue'

const { packageId, material, part } = defineProps<{ packageId: string; material: AdminMaterialRow | null; part: 'guide' | 'speaking' }>()
const emit = defineEmits<{ saved: [] }>()
const { busy, run } = useAction()
const editing = ref(false)

const guide = computed(() => {
  const r = TeacherGuide.safeParse(material?.teacher_guide as unknown)
  return r.success ? r.data : null
})
const plan = computed(() => {
  const r = SpeakingPlan.safeParse(material?.speaking_plan as unknown)
  return r.success ? r.data : null
})
const raw = computed(() => (part === 'guide' ? material?.teacher_guide : material?.speaking_plan) ?? null)
const issues = ref<string[]>([])

async function save(value: TeacherGuide | SpeakingPlan) {
  const schema = part === 'guide' ? TeacherGuide : SpeakingPlan
  const r = schema.safeParse(value)
  if (!r.success) {
    issues.value = r.error.issues.map((i) => `${i.path.join(' › ') || 'Alan'}: boş bırakılamaz veya geçersiz`)
    return
  }
  issues.value = []
  const json = r.data as unknown as Json
  const ok = await run(() => saveAdminMaterial(packageId, part === 'guide' ? { teacher_guide: json } : { speaking_plan: json }), 'Kaydedildi')
  if (ok) {
    editing.value = false
    emit('saved')
  }
}
</script>

<template>
  <BaseCard as="section" :aria-label="part === 'guide' ? 'Öğretmen rehberi' : 'Konuşma planı'">
    <template #head>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-base font-semibold">{{ part === 'guide' ? 'Öğretmen rehberi' : 'Konuşma planı' }}</h2>
          <p class="text-ink-soft text-sm">Yalnızca yönetici görür; öğrencilere gönderilmez.</p>
        </div>
        <BaseButton v-if="!editing" size="sm" variant="secondary" @click="editing = true">{{ (part === 'guide' ? guide : plan) ? 'Düzenle' : 'Oluştur' }}</BaseButton>
      </div>
    </template>
    <BaseAlert v-if="issues.length" class="mb-3" tone="danger">
      <ul class="list-disc ps-5">
        <li v-for="(x, i) in issues" :key="i">{{ x }}</li>
      </ul>
    </BaseAlert>
    <template v-if="part === 'guide'">
      <TeacherGuideForm v-if="editing" v-model:busy="busy" :guide="guide" @save="save" @cancel="editing = false" />
      <TeacherGuideView v-else-if="guide" :guide="guide" />
      <p v-else-if="raw" class="text-ink-soft text-sm">Kayıtlı rehber beklenen biçimde değil; düzenleyerek yeniden kaydedin.</p>
      <EmptyState v-else title="Rehber yok" description="AI üretimi rehberi otomatik hazırlar; elle de oluşturabilirsiniz." />
    </template>
    <template v-else>
      <SpeakingPlanForm v-if="editing" v-model:busy="busy" :plan="plan" @save="save" @cancel="editing = false" />
      <SpeakingPlanBlocks v-else-if="plan" :plan="plan" />
      <p v-else-if="raw" class="text-ink-soft text-sm">Kayıtlı plan beklenen biçimde değil; düzenleyerek yeniden kaydedin.</p>
      <EmptyState v-else title="Konuşma planı yok" />
    </template>
  </BaseCard>
</template>
