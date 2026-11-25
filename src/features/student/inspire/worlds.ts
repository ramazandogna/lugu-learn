import type { Component } from 'vue'
import { Clapperboard, FlaskConical, Gamepad2, Palette, Plane, Rocket, Users, Music } from 'lucide-vue-next'

/*
 * Raf kapakları: 8 dünya = 8 kavanoz = 8 hikâye (stories.ts). Yalnız kapak
 * bilgisi; içerik hikâyede. Kilit yok, hepsi baştan açık.
 */
export interface World {
  id: string
  title: string
  /** One line that makes you want to open it. */
  hook: string
  icon: Component
  /** A fixed mix of kit roles for the jar. Decoration with its own ground; words sit outside it. */
  tint: string
}

export const WORLDS: readonly World[] = [
  { id: 'oyun', title: 'Oyun dünyası', hook: 'Oyunun menüsünü ve görevlerini kendin anla.', icon: Gamepad2, tint: 'var(--color-primary-fill)' },
  { id: 'uzay', title: 'Uzay istasyonu', hook: 'Astronotların kayıtlarını dinle.', icon: Rocket, tint: 'color-mix(in oklab, var(--color-primary-fill) 60%, var(--color-ink))' },
  { id: 'tur', title: 'Dünya turu', hook: 'Havalimanında ve kafede kendi işini hallet.', icon: Plane, tint: 'color-mix(in oklab, var(--color-positive) 80%, var(--color-star))' },
  { id: 'film', title: 'Film stüdyosu', hook: 'Bir sahnenin repliğini altyazısız yakala.', icon: Clapperboard, tint: 'color-mix(in oklab, var(--color-accent) 85%, var(--color-ink))' },
  { id: 'muzik', title: 'Müzik sahnesi', hook: 'Şarkıdan bir dize yakala, kendi dizeni kur.', icon: Music, tint: 'color-mix(in oklab, var(--color-star) 80%, var(--color-accent))' },
  { id: 'bilim', title: 'Bilim laboratuvarı', hook: 'Deney yönergesini ve uyarıları oku.', icon: FlaskConical, tint: 'color-mix(in oklab, var(--color-positive) 70%, var(--color-primary-fill))' },
  { id: 'arkadas', title: 'Dünya arkadaşları', hook: 'Aynı yaşta biriyle tanışma sahnesini dene.', icon: Users, tint: 'color-mix(in oklab, var(--color-primary-fill) 55%, var(--color-accent))' },
  { id: 'uretim', title: 'Yaratıcı üretim', hook: 'Kendi karakterini İngilizce tanıt.', icon: Palette, tint: 'color-mix(in oklab, var(--color-accent) 70%, var(--color-primary-fill))' },
]
