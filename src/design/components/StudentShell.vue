<script setup lang="ts" generic="K extends string">
import { RouterLink } from 'vue-router'
import { AnnounceHost, TabBar, ToastHost, type TabItem } from 'rei-kit'
import { NavLinks, SkipLink } from 'rei-kit/web'

import type { CharacterKey } from '@/domain/content'

import { characterThemeStyle } from '../characters'
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
    :data-character="character"
    :style="character ? characterThemeStyle(character) : undefined"
  >
    <SkipLink for="lugu-main" :label="skipLabel" />
    <header class="border-hair z-30 shrink-0 border-b bg-[color-mix(in_oklab,var(--color-canvas)_88%,transparent)] backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
        <RouterLink :to="homeTo" class="focus-ring rounded-control -m-1 p-1" :aria-label="homeLabel">
          <LuguLogo size="sm" />
        </RouterLink>
        <NavLinks class="hidden md:block" :items="items" :active="active" :label="navLabel" />
        <div class="ms-auto flex items-center gap-2">
          <slot name="account" />
        </div>
      </div>
    </header>
    <main id="lugu-main" class="min-h-0 flex-1 overflow-y-auto pb-32 md:pb-10">
      <slot />
    </main>
    <div class="md:hidden">
      <TabBar :items="items" :active="active" :label="navLabel" />
    </div>
    <ToastHost :close-label="toastCloseLabel" />
    <AnnounceHost />
  </div>
</template>
