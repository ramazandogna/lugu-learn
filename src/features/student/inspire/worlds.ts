import type { Component } from 'vue'
import { Clapperboard, FlaskConical, Gamepad2, Palette, Plane, Rocket, Users, Music } from 'lucide-vue-next'

/*
 * "İngilizce ile neler yapabilirsin?" - 8 worlds (pedagog 7). Fixed content,
 * independent of any lesson package. No locks, no rewards: curiosity only.
 * Scenes are realistic; the chat scene is a simulation, never a real person.
 */
export interface WorldStep {
  en: string
  tr: string
  /** `___` in `en` is filled by a tap. Every option is a fine sentence: there is no wrong pick. */
  pick?: string[]
}

export interface World {
  id: string
  title: string
  /** One line that makes you want to open it. */
  hook: string
  icon: Component
  /** A fixed mix of kit roles for the jar. Decoration with its own ground; words sit outside it. */
  tint: string
  steps: WorldStep[]
  youKnow: { en: string; tr: string }
  /** Said out loud in the scene, so nobody mistakes a pretend scene for a real one. */
  note?: string
}

export const WORLDS: readonly World[] = [
  {
    id: 'oyun',
    title: 'Oyun dünyası',
    hook: 'Oyunun menüsünü ve görevlerini kendin anla.',
    icon: Gamepad2,
    tint: 'var(--color-primary-fill)',
    steps: [
      { en: 'Press START to play.', tr: 'Oynamak için START tuşuna bas.' },
      { en: 'Level 2 is open!', tr: 'İkinci bölüm açıldı!' },
      { en: 'Choose your hero: ___', tr: 'Kahramanını seç.', pick: ['the fast fox', 'the brave owl', 'the funny robot'] },
    ],
    youKnow: { en: 'I can play this game.', tr: 'Bu oyunu oynayabilirim.' },
  },
  {
    id: 'uzay',
    title: 'Uzay istasyonu',
    hook: 'Astronotların kayıtlarını dinle.',
    icon: Rocket,
    tint: 'color-mix(in oklab, var(--color-primary-fill) 60%, var(--color-ink))',
    steps: [
      { en: 'Three, two, one... go!', tr: 'Üç, iki, bir... fırla!' },
      { en: 'Houston, we have a message.', tr: 'Houston, bir mesajımız var.' },
      { en: 'Today I can see the ___.', tr: 'Bugün ___ görebiliyorum.', pick: ['Moon', 'Earth', 'stars'] },
    ],
    youKnow: { en: 'It is a big planet.', tr: 'Büyük bir gezegen.' },
  },
  {
    id: 'tur',
    title: 'Dünya turu',
    hook: 'Havalimanında ve kafede kendi işini hallet.',
    icon: Plane,
    tint: 'color-mix(in oklab, var(--color-positive) 80%, var(--color-star))',
    steps: [
      { en: 'What time is it?', tr: 'Saat kaç?' },
      { en: 'A table for two, please.', tr: 'İki kişilik masa, lütfen.' },
      { en: 'I would like a ___, please.', tr: 'Bir ___ istiyorum, lütfen.', pick: ['tea', 'juice', 'sandwich'] },
    ],
    youKnow: { en: 'What time is it?', tr: 'Saat kaç?' },
  },
  {
    id: 'film',
    title: 'Film stüdyosu',
    hook: 'Bir sahnenin repliğini altyazısız yakala.',
    icon: Clapperboard,
    tint: 'color-mix(in oklab, var(--color-accent) 85%, var(--color-ink))',
    steps: [
      { en: 'Quiet on set! Action!', tr: 'Sette sessizlik! Çekim başlasın!' },
      { en: 'She is the hero of the story.', tr: 'O, hikâyenin kahramanı.' },
      { en: 'I am your ___.', tr: 'Kendini tanıt: sen kimsin?', pick: ['friend', 'guide', 'neighbour'] },
    ],
    youKnow: { en: 'He is my friend.', tr: 'O benim arkadaşım.' },
  },
  {
    id: 'muzik',
    title: 'Müzik sahnesi',
    hook: 'Şarkıdan bir dize yakala, kendi dizeni kur.',
    icon: Music,
    tint: 'color-mix(in oklab, var(--color-star) 80%, var(--color-accent))',
    steps: [
      { en: 'One, two, three, four!', tr: 'Bir, iki, üç, dört!' },
      { en: 'Sing along with me.', tr: 'Benimle birlikte söyle.' },
      { en: 'I sing in the ___.', tr: 'Ne zaman şarkı söylersin?', pick: ['morning', 'rain', 'night'] },
    ],
    youKnow: { en: 'I like music.', tr: 'Müziği severim.' },
  },
  {
    id: 'bilim',
    title: 'Bilim laboratuvarı',
    hook: 'Deney yönergesini ve uyarıları oku.',
    icon: FlaskConical,
    tint: 'color-mix(in oklab, var(--color-positive) 70%, var(--color-primary-fill))',
    steps: [
      { en: "Don't touch! It is hot.", tr: 'Dokunma! Sıcak.' },
      { en: 'Mix the blue water and the red water.', tr: 'Mavi suyla kırmızı suyu karıştır.' },
      { en: 'Now let us ___!', tr: 'Şimdi ne yapalım?', pick: ['watch', 'wait', 'write'] },
    ],
    youKnow: { en: "Don't touch!", tr: 'Dokunma!' },
  },
  {
    id: 'arkadas',
    title: 'Dünya arkadaşları',
    hook: 'Aynı yaşta biriyle tanışma sahnesini dene.',
    icon: Users,
    tint: 'color-mix(in oklab, var(--color-primary-fill) 55%, var(--color-accent))',
    note: 'Mia gerçek biri değil; bu sahne bir canlandırma. Burada kimseyle yazışmıyorsun, kişisel bilgi de vermiyorsun.',
    steps: [
      { en: 'Hi! I am Mia. I am 11.', tr: 'Merhaba! Ben Mia. 11 yaşındayım.' },
      { en: 'I like ___.', tr: 'Neyi sevdiğini seç.', pick: ['drawing', 'football', 'cats'] },
      { en: 'And you? What do you like?', tr: 'Ya sen? Sen ne seversin?' },
    ],
    youKnow: { en: 'Hi! I am Piko.', tr: 'Merhaba! Ben Piko.' },
  },
  {
    id: 'uretim',
    title: 'Yaratıcı üretim',
    hook: 'Kendi karakterini İngilizce tanıt.',
    icon: Palette,
    tint: 'color-mix(in oklab, var(--color-accent) 70%, var(--color-primary-fill))',
    steps: [
      { en: 'This is my character.', tr: 'Bu benim karakterim.' },
      { en: 'Her name is Zip. She is brave.', tr: 'Adı Zip. Cesur biri.' },
      { en: 'She is ___.', tr: 'Nasıl biri olsun?', pick: ['funny', 'fast', 'kind'] },
    ],
    youKnow: { en: 'This is my monster.', tr: 'Bu benim canavarım.' },
  },
]

const KEY = 'lugu.inspire.opened'

/** Worlds the learner has opened (curiosity trail, never a lock). */
export function openedWorlds(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function markOpened(id: string): string[] {
  const next = [...new Set([...openedWorlds(), id])]
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage blocked: the trail just does not persist */
  }
  return next
}

/** `___` replaced; no blank = the line as is. */
export const fillLine = (en: string, pick: string | null) => (pick ? en.replace('___', pick) : en)
