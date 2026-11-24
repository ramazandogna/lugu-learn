<script setup lang="ts" generic="K extends string">
import { RouterLink } from 'vue-router'
import { AnnounceHost, TabBar, ToastHost, type TabItem } from 'rei-kit'
import { NavLinks, SkipLink } from 'rei-kit/web'

import type { CharacterKey } from '@/domain/content'

import { characterThemeStyle } from '../characters'
import { unitThemeAttrs } from '../unitThemes'
import LuguLogo from './LuguLogo.vue'
import { useDocumentArea } from './useDocumentArea'

/*
 * The student app frame. Phone: brand bar on top, rei-kit's floating TabBar at
 * the bottom. Tablet and up: the same items as NavLinks in the top bar and no
 * bottom bar. The page scrolls inside <main>, which is what lets the tab bar
 * float over it. One ToastHost and one AnnounceHost live here — App.vue must
 * not render a second.
 */
const {
  items,
  active,
  navLabel,
  skipLabel,
  homeLabel,
  homeTo = '/',
  toastCloseLabel,
  character,
  unit,
  fill = 'viewport',
  scopeDocument = true,
} = defineProps<{
  /** Same items for the bottom bar and the top links. */
  items: readonly TabItem<K>[]
  active?: K
  /** e.g. "Ana menü". */
  navLabel: string
  /** e.g. "İçeriğe geç". */
  skipLabel: string
  /** Accessible name of the logo link, e.g. "Lugu ana sayfa". */
  homeLabel: string
  homeTo?: string
  /** e.g. "Kapat". */
  toastCloseLabel: string
  /** A character theme for the whole app (the learner's favourite), if any. */
  character?: CharacterKey
  /** Unit theme id (`data-unit`); the unit's colours win over the character's. */
  unit?: string
  /** `parent` to fill a framed preview instead of the window. */
  fill?: 'viewport' | 'parent'
  /** Mirror `data-area` onto <html> so teleported overlays match. */
  scopeDocument?: boolean
}>()

useDocumentArea('student', () => scopeDocument)
</script>

<template>
  <div
    data-area="student"
    class="canvas text-ink relative flex flex-col overflow-hidden"
    :class="fill === 'viewport' ? 'h-dvh' : 'h-full'"
    v-bind="unitThemeAttrs(unit)"
    :data-character="character"
    :style="character ? characterThemeStyle(character) : undefined"
  >
    <SkipLink for="lugu-main" :label="skipLabel" />
    <header class="border-hair z-(--z-header) shrink-0 border-b bg-(--glass) backdrop-blur-md">
      <div class="mx-auto flex h-(--header-h) max-w-6xl items-center gap-4 px-4 md:px-6">
        <RouterLink :to="homeTo" class="focus-ring rounded-control -mx-1 inline-flex min-h-11 items-center px-1" :aria-label="homeLabel">
          <LuguLogo size="sm" />
        </RouterLink>
        <NavLinks class="hidden md:block" :items="items" :active="active" :label="navLabel" />
        <div class="ms-auto flex items-center gap-2">
          <slot name="account" />
        </div>
      </div>
    </header>
    <main id="lugu-main" class="min-h-0 flex-1 overflow-y-auto pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+var(--space-6))] md:pb-12">
      <slot />
    </main>
    <div class="md:hidden">
      <TabBar :items="items" :active="active" :label="navLabel" />
    </div>
    <ToastHost :close-label="toastCloseLabel" />
    <AnnounceHost />
  </div>
</template>
