<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { History, House, Map, Trophy, User } from 'lucide-vue-next'

import { AvatarArt, StudentShell, XpBadge } from '@/design'

import { isAvatarKey } from './profile'
import { useStudentHome } from './useStudentHome'

type Tab = 'home' | 'map' | 'achievements' | 'history' | 'profile'

const route = useRoute()
const { home, mainAssignment } = useStudentHome()

const items = computed(() => [
  { key: 'home' as const, to: '/', label: 'Ana sayfa', icon: House },
  { key: 'map' as const, to: mainAssignment.value ? `/harita/${mainAssignment.value.id}` : '/', label: 'Harita', icon: Map },
  { key: 'achievements' as const, to: '/basarilar', label: 'Başarılar', icon: Trophy },
  { key: 'history' as const, to: '/gecmis', label: 'Geçmiş', icon: History },
  { key: 'profile' as const, to: '/profil', label: 'Profil', icon: User },
])

const ACTIVE: Record<string, Tab> = {
  'student-home': 'home',
  'student-map': 'map',
  'student-lesson': 'map',
  'student-replay': 'map',
  'student-achievements': 'achievements',
  'student-history': 'history',
  'student-profile': 'profile',
}
const active = computed<Tab | undefined>(() => ACTIVE[String(route.name ?? '')])
const avatar = computed(() => {
  const k = home.value?.profile?.avatar_key
  return isAvatarKey(k) ? k : null
})
const xpLabel = computed(() => `Toplam ${new Intl.NumberFormat('tr-TR').format(home.value?.xp ?? 0)} XP`)
</script>

<template>
  <StudentShell :items="items" :active="active" nav-label="Ana menü" skip-label="İçeriğe geç" home-label="Lugu ana sayfa" toast-close-label="Kapat">
    <template #account>
      <XpBadge v-if="home" :xp="home.xp" size="sm" :label="xpLabel" />
      <RouterLink v-if="avatar" to="/profil" class="focus-ring grid size-11 place-items-center rounded-full" aria-label="Profilim">
        <AvatarArt :avatar="avatar" :size="36" />
      </RouterLink>
    </template>
    <RouterView />
  </StudentShell>
</template>
