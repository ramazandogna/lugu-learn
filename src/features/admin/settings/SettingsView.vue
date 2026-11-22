<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PageHeader } from 'rei-kit'
import { BaseTabs, type TabPanel } from 'rei-kit/web'
import AchievementsPanel from './AchievementsPanel.vue'
import DeletionPanel from './DeletionPanel.vue'
import SchoolsPanel from './SchoolsPanel.vue'
import SystemSettingsPanel from './SystemSettingsPanel.vue'
import ThemePanel from './ThemePanel.vue'

type Tab = 'sistem' | 'okullar' | 'basarilar' | 'silme' | 'tema'
const tabs: TabPanel<Tab>[] = [
  { key: 'sistem', label: 'Sistem ayarları' },
  { key: 'okullar', label: 'Okullar' },
  { key: 'basarilar', label: 'Başarılar' },
  { key: 'silme', label: 'Veri silme' },
  { key: 'tema', label: 'Tema' },
]
const route = useRoute()
const router = useRouter()
const tab = computed<Tab>({
  get: () => (tabs.some((t) => t.key === route.query.sekme) ? (route.query.sekme as Tab) : 'sistem'),
  set: (v) => void router.replace({ query: { sekme: v } }),
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Ayarlar" as="h1" />
    <BaseTabs v-model="tab" :items="tabs" label="Ayar bölümleri">
      <template #default="{ active }">
        <div class="pt-4">
          <SystemSettingsPanel v-if="active === 'sistem'" />
          <SchoolsPanel v-else-if="active === 'okullar'" />
          <AchievementsPanel v-else-if="active === 'basarilar'" />
          <DeletionPanel v-else-if="active === 'silme'" />
          <ThemePanel v-else />
        </div>
      </template>
    </BaseTabs>
  </div>
</template>
