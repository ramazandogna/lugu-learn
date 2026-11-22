<script setup lang="ts">
import { BookOpen, ChartLine, GraduationCap, House, LayoutDashboard, Map, MessagesSquare, Settings, Trophy, User, Users } from 'lucide-vue-next'

import AdminShell from '../components/AdminShell.vue'
import AvatarArt from '../components/AvatarArt.vue'
import StudentShell from '../components/StudentShell.vue'
import XpBadge from '../components/XpBadge.vue'
import GallerySection from './GallerySection.vue'

const here = '/dev/design'
const studentItems = [
  { key: 'home', to: here, label: 'Ana sayfa', icon: House },
  { key: 'map', to: `${here}#map`, label: 'Harita', icon: Map },
  { key: 'achievements', to: `${here}#a`, label: 'Başarılar', icon: Trophy },
  { key: 'profile', to: `${here}#p`, label: 'Profil', icon: User },
] as const
const adminItems = [
  { key: 'dashboard', to: here, label: 'Panel', icon: LayoutDashboard },
  { key: 'students', to: `${here}#s`, label: 'Öğrenciler', icon: Users },
  { key: 'curricula', to: `${here}#c`, label: 'Müfredatlar', icon: BookOpen },
  { key: 'analytics', to: `${here}#an`, label: 'Öğrenme Analitiği', icon: ChartLine },
  { key: 'academic', to: `${here}#ac`, label: 'Akademik Takip', icon: GraduationCap },
  { key: 'coaching', to: `${here}#co`, label: 'Konuşma & Koçluk', icon: MessagesSquare },
  { key: 'settings', to: `${here}#se`, label: 'Ayarlar', icon: Settings },
] as const
</script>

<template>
  <GallerySection title="Öğrenci kabuğu" note="Telefonda alt sekme çubuğu, tablet ve üstünde üst bağlantılar.">
    <div class="rounded-card border-hair h-[34rem] overflow-hidden border">
      <StudentShell
        :items="studentItems"
        active="home"
        nav-label="Ana menü"
        skip-label="İçeriğe geç"
        home-label="Lugu ana sayfa"
        toast-close-label="Kapat"
        fill="parent"
        :scope-document="false"
      >
        <template #account>
          <XpBadge :xp="1240" size="sm" label="Toplam 1.240 XP" />
          <AvatarArt avatar="fox-scout" :size="36" label="Profilim" />
        </template>
        <div class="p-6">
          <p class="type-eyebrow text-ink-soft">Programım</p>
          <h3 class="type-hero text-ink">Merhaba Ece!</h3>
          <p class="text-ink-soft mt-2">Bugün bir adım daha.</p>
        </div>
      </StudentShell>
    </div>
  </GallerySection>

  <GallerySection title="Yönetim kabuğu" note="Masaüstünde kenar çubuğu; tablette çekmece. Aynı marka, daha sakin.">
    <div class="rounded-card border-hair h-[34rem] overflow-hidden border">
      <AdminShell
        :items="adminItems"
        active="students"
        nav-label="Yönetim menüsü"
        skip-label="İçeriğe geç"
        menu-label="Menüyü aç"
        close-label="Kapat"
        toast-close-label="Kapat"
        brand-suffix="Yönetim"
        fill="parent"
        :scope-document="false"
      >
        <template #topbar><p class="text-ink truncate font-bold">Öğrenciler</p></template>
        <h3 class="type-title text-ink">Öğrenciler</h3>
        <p class="text-ink-soft mt-1 text-sm">Örnek içerik — gerçek veri değildir.</p>
      </AdminShell>
    </div>
  </GallerySection>
</template>
