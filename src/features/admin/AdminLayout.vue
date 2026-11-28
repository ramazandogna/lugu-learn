<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { BookOpen, LayoutDashboard, LogOut, MessagesSquare, Settings, Users } from 'lucide-vue-next'
import { BaseButton, type TabItem } from 'rei-kit'
import { AdminShell } from '@/design'
import { signOut } from '@/lib/auth'

type NavKey = 'dashboard' | 'students' | 'curricula' | 'speaking' | 'settings'

const items: TabItem<NavKey>[] = [
  { key: 'dashboard', to: '/admin', label: 'Bugün', icon: LayoutDashboard },
  { key: 'students', to: '/admin/ogrenciler', label: 'Öğrenciler', icon: Users },
  { key: 'speaking', to: '/admin/konusma', label: 'Oturumlar', icon: MessagesSquare },
  { key: 'curricula', to: '/admin/mufredatlar', label: 'Müfredat', icon: BookOpen },
  { key: 'settings', to: '/admin/ayarlar', label: 'Ayarlar', icon: Settings },
]

const ROUTE_KEY: Record<string, NavKey> = {
  'admin-dashboard': 'dashboard',
  'admin-students': 'students',
  'admin-student': 'students',
  'admin-curricula': 'curricula',
  'admin-curriculum': 'curricula',
  'admin-lesson': 'curricula',
  'admin-lesson-preview': 'curricula',
  'admin-speaking': 'speaking',
  'admin-speaking-session': 'speaking',
  'admin-settings': 'settings',
}

const route = useRoute()
const router = useRouter()
const active = computed(() => ROUTE_KEY[String(route.name ?? '')])

async function logout() {
  await signOut()
  await router.push({ name: 'login' })
}
</script>

<template>
  <AdminShell
    :items="items"
    :active="active"
    nav-label="Yönetim menüsü"
    skip-label="İçeriğe geç"
    menu-label="Menüyü aç"
    close-label="Kapat"
    toast-close-label="Bildirimi kapat"
    brand-suffix="Yönetim"
  >
    <template #account>
      <BaseButton variant="quiet" class="max-sm:hidden" @click="logout">
        <LogOut class="size-4" aria-hidden="true" />
        Çıkış yap
      </BaseButton>
      <BaseButton variant="quiet" icon class="sm:hidden" aria-label="Çıkış yap" @click="logout">
        <LogOut class="size-4" aria-hidden="true" />
      </BaseButton>
    </template>
    <RouterView />
  </AdminShell>
</template>
