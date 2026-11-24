<script setup lang="ts" generic="K extends string">
import { ref } from 'vue'
import { Menu } from 'lucide-vue-next'
import { AnnounceHost, BaseButton, ToastHost, type TabItem } from 'rei-kit'
import { BaseDrawer, SkipLink } from 'rei-kit/web'

import AdminNavList from './AdminNavList.vue'
import LuguLogo from './LuguLogo.vue'
import { useDocumentArea } from './useDocumentArea'

/*
 * The admin frame: calm and dense. Desktop (lg+): a fixed sidebar. Tablet and
 * phone: the same list in rei-kit's drawer behind a menu button in the top
 * bar. `data-area="admin"` tones the brand down (neutral ground, tighter
 * radii, body font for headings) without a second design system.
 */
const {
  items,
  active,
  navLabel,
  skipLabel,
  menuLabel,
  closeLabel,
  toastCloseLabel,
  brandSuffix,
  fill = 'viewport',
  scopeDocument = true,
} = defineProps<{
  /** Panel, Öğrenciler, Müfredatlar, Öğrenme Analitiği, Akademik Takip, Konuşma & Koçluk, Ayarlar. */
  items: readonly TabItem<K>[]
  active?: K
  /** e.g. "Yönetim menüsü"; also the drawer title. */
  navLabel: string
  skipLabel: string
  /** e.g. "Menüyü aç". */
  menuLabel: string
  /** e.g. "Kapat". */
  closeLabel: string
  toastCloseLabel: string
  /** Shown after the wordmark, e.g. "Yönetim". */
  brandSuffix?: string
  fill?: 'viewport' | 'parent'
  scopeDocument?: boolean
}>()

const open = ref(false)
useDocumentArea('admin', () => scopeDocument)
</script>

<template>
  <div
    data-area="admin"
    class="canvas text-ink flex"
    :class="fill === 'viewport' ? 'min-h-dvh' : 'h-full overflow-hidden'"
  >
    <SkipLink for="lugu-admin-main" :label="skipLabel" />
    <aside class="bg-surface border-hair hidden w-64 shrink-0 flex-col border-e lg:flex" :class="fill === 'viewport' ? 'sticky top-0 h-dvh' : ''">
      <div class="flex h-(--header-h) items-center px-4">
        <LuguLogo size="sm" :suffix="brandSuffix" />
      </div>
      <div class="flex-1 overflow-y-auto px-3 py-2">
        <AdminNavList :items="items" :active="active" :label="navLabel" />
      </div>
      <div v-if="$slots.sidebarFooter" class="border-hair border-t p-3">
        <slot name="sidebarFooter" />
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col" :class="{ 'overflow-y-auto': fill === 'parent' }">
      <header class="bg-surface border-hair sticky top-0 z-(--z-header) flex h-(--header-h) shrink-0 items-center gap-3 border-b px-4 lg:px-8">
        <BaseButton class="lg:hidden" variant="quiet" icon :aria-label="menuLabel" :aria-expanded="open" @click="open = true">
          <Menu class="size-5" aria-hidden="true" />
        </BaseButton>
        <LuguLogo class="lg:hidden" variant="mark" size="sm" :label="brandSuffix ? `Lugu ${brandSuffix}` : 'Lugu'" />
        <div class="min-w-0 flex-1">
          <slot name="topbar" />
        </div>
        <slot name="account" />
      </header>
      <main id="lugu-admin-main" class="mx-auto w-full max-w-(--measure-page) flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>

    <BaseDrawer v-model="open" :title="navLabel" :close-label="closeLabel" side="start" size="18rem">
      <AdminNavList :items="items" :active="active" :label="navLabel" @navigate="open = false" />
    </BaseDrawer>
    <ToastHost :close-label="toastCloseLabel" />
    <AnnounceHost />
  </div>
</template>
