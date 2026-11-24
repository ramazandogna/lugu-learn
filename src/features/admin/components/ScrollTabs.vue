<script setup lang="ts" generic="K extends string">
import { nextTick, onMounted, useTemplateRef, watch } from 'vue'
import { BaseTabs, type TabPanel } from 'rei-kit/web'

/*
 * BaseTabs for admin: the tab row scrolls inside its own box (never the
 * page), tabs never wrap, each is a 40px target, and the active tab is
 * brought into view when it changes or on first paint.
 */
const active = defineModel<K>({ required: true })
defineProps<{ items: TabPanel<K>[]; label?: string }>()

const root = useTemplateRef<HTMLElement>('root')

function reveal() {
  const bar = root.value?.querySelector<HTMLElement>('[role="tablist"]')
  const tab = bar?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
  if (!bar || !tab) return
  const left = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2
  bar.scrollTo({ left: Math.max(0, left), behavior: 'auto' })
}
onMounted(() => void nextTick(reveal))
watch(active, () => void nextTick(reveal))
</script>

<template>
  <div ref="root" class="admin-tabs min-w-0">
    <BaseTabs v-model="active" :items="items" :label="label">
      <template #default="slot"><slot v-bind="slot" /></template>
    </BaseTabs>
  </div>
</template>

<style scoped>
.admin-tabs :deep([role='tablist']) {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  max-width: 100%;
}
.admin-tabs :deep([role='tab']) {
  flex-shrink: 0;
  white-space: nowrap;
  min-height: 2.5rem;
}
</style>
