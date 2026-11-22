<script setup lang="ts" generic="K extends string">
import { RouterLink } from 'vue-router'
import type { TabItem } from 'rei-kit'

/*
 * The admin sidebar's links. Written here because rei-kit's NavLinks is a
 * horizontal row without icons; a vertical, iconed list is the shape an
 * education-management sidebar needs (kit gap, reported). Same contract as
 * NavLinks: a named <nav>, real links, aria-current on the active one, a
 * visible focus ring.
 */
const { items, active, label } = defineProps<{
  items: readonly TabItem<K>[]
  active?: K
  label: string
}>()

const emit = defineEmits<{ navigate: [key: K] }>()
</script>

<template>
  <nav :aria-label="label">
    <ul class="flex flex-col gap-0.5">
      <li v-for="item in items" :key="item.key">
        <RouterLink
          :to="item.to"
          class="focus-ring rounded-control relative flex min-h-11 items-center gap-3 px-3 text-sm font-semibold transition-colors duration-(--duration-fast)"
          :class="item.key === active ? 'bg-wash text-ink' : 'text-ink-soft hover:bg-muted hover:text-ink'"
          :aria-current="item.key === active ? 'page' : undefined"
          @click="emit('navigate', item.key)"
        >
          <span
            v-if="item.key === active"
            class="bg-primary absolute inset-y-2 -start-3 w-1 rounded-full"
            aria-hidden="true"
          />
          <component :is="item.icon" class="size-[18px] shrink-0" :stroke-width="item.key === active ? 2.4 : 2" aria-hidden="true" />
          <span class="truncate">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
