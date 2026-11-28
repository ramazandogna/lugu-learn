<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { BaseBadge } from 'rei-kit'
import type { TabPanel } from 'rei-kit/web'
import { getStudent, studentLearning } from '@/lib/api/admin'
import LoadState from '../components/LoadState.vue'
import { ACCOUNT_STATUS, ACCOUNT_TONE } from '../lib/format'
import { useLoad } from '../lib/use-load'
import StudentAccountActions from './StudentAccountActions.vue'
import StudentProfileTab from './tabs/StudentProfileTab.vue'
import StudentProgramTab from './tabs/StudentProgramTab.vue'
import StudentProgressTab from './tabs/StudentProgressTab.vue'
import StudentSpeakingTab from './tabs/StudentSpeakingTab.vue'
import PageHeader from '../components/AdminPageHeader.vue'
import BaseTabs from '../components/ScrollTabs.vue'

type TabKey = 'ilerleme' | 'program' | 'konusma' | 'profil'
const tabs: TabPanel<TabKey>[] = [
  { key: 'ilerleme', label: 'İlerleme' },
  { key: 'program', label: 'Program' },
  { key: 'konusma', label: 'Konuşma' },
  { key: 'profil', label: 'Profil' },
]
/** Old `?sekme=` values keep working. */
const LEGACY: Record<string, TabKey> = { ai: 'ilerleme', gecmis: 'ilerleme', zaman: 'ilerleme', uzman: 'ilerleme', gorevler: 'konusma', akademik: 'profil' }

const route = useRoute()
const router = useRouter()
const studentId = computed(() => String(route.params.studentId))
const tab = computed<TabKey>({
  get: () => {
    const q = String(route.query.sekme ?? '')
    return tabs.some((t) => t.key === q) ? (q as TabKey) : (LEGACY[q] ?? 'ilerleme')
  },
  set: (v) => void router.replace({ query: { ...route.query, sekme: v } }),
})

const student = useLoad(() => getStudent(studentId.value), studentId)
const learning = useLoad(() => studentLearning(studentId.value), studentId)
</script>

<template>
  <div class="flex flex-col gap-6">
    <RouterLink :to="{ name: 'admin-students' }" class="focus-ring rounded-cell text-ink-soft -my-2 inline-flex min-h-10 w-fit items-center type-small hover:underline">‹ Öğrenciler</RouterLink>
    <LoadState
      :loading="student.loading.value"
      :error="student.error.value"
      :empty="!student.data.value"
      empty-title="Öğrenci bulunamadı"
      @retry="student.reload"
    >
      <template v-if="student.data.value">
        <PageHeader :title="student.data.value.name" as="h1">
          <template #right>
            <div class="flex items-center gap-2">
              <BaseBadge :tone="ACCOUNT_TONE[student.data.value.status]">{{ ACCOUNT_STATUS[student.data.value.status] }}</BaseBadge>
              <StudentAccountActions
                :student-id="student.data.value.id"
                :code="student.data.value.code"
                :name="student.data.value.name"
                :status="student.data.value.status"
                @changed="student.reload"
              />
            </div>
          </template>
        </PageHeader>
        <p class="text-ink-soft -mt-4 type-small">
          {{ student.data.value.code }}
          <template v-if="student.data.value.grade"> · {{ student.data.value.grade }}. sınıf</template>
          <template v-if="student.data.value.school"> · {{ student.data.value.school.name }}</template>
        </p>

        <BaseTabs v-model="tab" :items="tabs" label="Öğrenci bölümleri">
          <template #default="{ active }">
            <div class="pt-4">
              <StudentProfileTab v-if="active === 'profil'" :student="student.data.value" @saved="student.reload" />
              <StudentSpeakingTab v-else-if="active === 'konusma'" :student="student.data.value" />
              <StudentProgramTab v-else-if="active === 'program'" :student-id="studentId" @changed="student.reload(); learning.reload()" />
              <LoadState v-else :loading="learning.loading.value" :error="learning.error.value" @retry="learning.reload">
                <StudentProgressTab v-if="learning.data.value" :student="student.data.value" :data="learning.data.value" />
              </LoadState>
            </div>
          </template>
        </BaseTabs>
      </template>
    </LoadState>
  </div>
</template>
