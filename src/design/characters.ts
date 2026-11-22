/**
 * The character registry: one place that knows who each character is, what
 * they look like and which colours their theme lends the UI.
 *
 * A theme changes colour only. `characterThemeStyle()` writes `--char-*`
 * custom properties and `data-character` on an element; main.css maps those
 * onto the kit's roles for that subtree, so layout never moves when the
 * character changes. Role colours are the *deep* shade of the character (they
 * carry text and focus rings); the mascot's bright body colour lives in
 * `mascots/` and is decoration.
 */
import type { CharacterKey, SectionKey } from '@/domain/content'

import { EXPRESSIONS, MASCOT_PALETTES, type Expression, type MascotPalette } from './mascots'

export type Motif = 'ocean' | 'blossom' | 'sunshine' | 'dream' | 'courage'

/** Every colour is measured in styling.test.ts: on-* ≥ 4.5:1, primary on canvas ≥ 4.5:1. */
export interface CharacterTheme {
  primary: string
  onPrimary: string
  accent: string
  onAccent: string
  /** The soft ground behind a character's scenes and bubbles. */
  wash: string
  primaryNight: string
  onPrimaryNight: string
  accentNight: string
  onAccentNight: string
  washNight: string
}

export interface CharacterDef {
  key: CharacterKey
  name: string
  /** One line, Turkish: what this character does in a lesson. */
  role: string
  /** Lesson areas this character leads. */
  domains: readonly string[]
  personality: readonly string[]
  theme: CharacterTheme
  art: MascotPalette
  motif: Motif
  catchphrases: readonly string[]
  expressions: readonly Expression[]
}

const INK_DAY = '#251d3a'
const INK_NIGHT = '#15112a'

export const CHARACTERS: Record<CharacterKey, CharacterDef> = {
  piko: {
    key: 'piko',
    name: 'Piko',
    role: 'Dilbilgisini çözer, ipuçları verir.',
    domains: ['grammar', 'explanation', 'tips', 'discovery'],
    personality: ['meraklı', 'sakin', 'zeki', 'yardımsever'],
    theme: {
      primary: '#0b6e94', onPrimary: '#ffffff', accent: '#5cc8ec', onAccent: INK_DAY, wash: '#e4f4fb',
      primaryNight: '#6fd0f2', onPrimaryNight: INK_NIGHT, accentNight: '#5cc8ec', onAccentNight: INK_NIGHT, washNight: '#10283a',
    },
    art: MASCOT_PALETTES.piko,
    motif: 'ocean',
    catchphrases: ['Bir bakalım, bunun bir kuralı var.', 'Küçük bir ipucu: fiile dikkat et.', 'Hata yapmak keşfin bir parçası.', 'Adım adım çözelim.'],
    expressions: EXPRESSIONS,
  },
  sasha: {
    key: 'sasha',
    name: 'Sasha',
    role: 'Quizleri ve konuşmayı coşkuyla yönetir.',
    domains: ['quiz', 'games', 'celebration', 'speaking', 'motivation'],
    personality: ['enerjik', 'sosyal', 'pozitif', 'cesaretlendirici'],
    theme: {
      primary: '#b42a6f', onPrimary: '#ffffff', accent: '#ff8fc4', onAccent: INK_DAY, wash: '#fde9f2',
      primaryNight: '#ff8fc4', onPrimaryNight: INK_NIGHT, accentNight: '#ff8fc4', onAccentNight: INK_NIGHT, washNight: '#2e1630',
    },
    art: MASCOT_PALETTES.sasha,
    motif: 'blossom',
    catchphrases: ['Hadi, bir tur daha!', 'Sesini duymak istiyorum.', 'İşte bu! Harika gidiyorsun.', 'Yanlış cevap da bir adım.'],
    expressions: EXPRESSIONS,
  },
  momo: {
    key: 'momo',
    name: 'Momo',
    role: 'Görevleri ve keşifleri başlatır.',
    domains: ['missions', 'discovery', 'travel', 'exploration'],
    personality: ['maceracı', 'meraklı', 'enerjik', 'kaşif'],
    theme: {
      primary: '#8a5a00', onPrimary: '#ffffff', accent: '#f6c431', onAccent: INK_DAY, wash: '#fff4cf',
      primaryNight: '#f6c431', onPrimaryNight: INK_NIGHT, accentNight: '#f6c431', onAccentNight: INK_NIGHT, washNight: '#2d2410',
    },
    art: MASCOT_PALETTES.momo,
    motif: 'sunshine',
    catchphrases: ['Haritada yeni bir yer açıldı!', 'Görev hazır, sen hazır mısın?', 'Bakalım bu yol nereye çıkıyor.', 'Bir keşif daha tamam.'],
    expressions: EXPRESSIONS,
  },
  dora: {
    key: 'dora',
    name: 'Dora',
    role: 'Hikâyeleri, okumayı ve dinlemeyi anlatır.',
    domains: ['reading', 'story', 'listening', 'dialogue', 'imagination'],
    personality: ['hayalperest', 'yaratıcı', 'sakin', 'hikâyeci'],
    theme: {
      primary: '#7438bf', onPrimary: '#ffffff', accent: '#b99cf2', onAccent: INK_DAY, wash: '#f1eafd',
      primaryNight: '#c3a8ff', onPrimaryNight: INK_NIGHT, accentNight: '#b99cf2', onAccentNight: INK_NIGHT, washNight: '#241a40',
    },
    art: MASCOT_PALETTES.dora,
    motif: 'dream',
    catchphrases: ['Bir hikâye başlamak üzere…', 'Kelimeleri bir resim gibi düşün.', 'Yavaşça oku, acele yok.', 'Sence sonra ne olacak?'],
    expressions: EXPRESSIONS,
  },
  leo: {
    key: 'leo',
    name: 'Leo',
    role: 'Canlandırma ve gerçek hayat görevlerinde yanında.',
    domains: ['role-play', 'speaking', 'challenges', 'real-life'],
    personality: ['cesur', 'kararlı', 'arkadaş canlısı', 'cesaretlendirici'],
    theme: {
      primary: '#b04a0c', onPrimary: '#ffffff', accent: '#ff9d45', onAccent: INK_DAY, wash: '#ffeedf',
      primaryNight: '#ffa45c', onPrimaryNight: INK_NIGHT, accentNight: '#ff9d45', onAccentNight: INK_NIGHT, washNight: '#2f1c12',
    },
    art: MASCOT_PALETTES.leo,
    motif: 'courage',
    catchphrases: ['Gerçek hayatta da yapabilirsin.', 'Zor mu? O zaman tam bize göre.', 'Bir kez daha, bu sefer daha cesur.', 'Bugün bir adım daha.'],
    expressions: EXPRESSIONS,
  },
}

/** The custom properties a character theme sets; pair with `data-character`. */
export function characterThemeStyle(key: CharacterKey): Record<string, string> {
  const t = CHARACTERS[key].theme
  return {
    '--char-primary': t.primary,
    '--char-on-primary': t.onPrimary,
    '--char-accent': t.accent,
    '--char-on-accent': t.onAccent,
    '--char-wash': t.wash,
    '--char-primary-night': t.primaryNight,
    '--char-on-primary-night': t.onPrimaryNight,
    '--char-accent-night': t.accentNight,
    '--char-on-accent-night': t.onAccentNight,
    '--char-wash-night': t.washNight,
  }
}

/** Everything to `v-bind` on an element to theme its subtree. */
export function characterAttrs(key: CharacterKey): { 'data-character': CharacterKey; style: Record<string, string> } {
  return { 'data-character': key, style: characterThemeStyle(key) }
}

/** Which character leads each lesson section, unless the lesson package names one. */
export const SECTION_CHARACTER: Record<SectionKey, CharacterKey> = {
  review: 'momo',
  vocabulary: 'piko',
  vocab_quiz: 'sasha',
  story: 'dora',
  explanation: 'piko',
  homework: 'leo',
  assessment: 'sasha',
}

/** Who hosts the moments between sections. */
export const MOMENT_CHARACTER = { break: 'dora', completion: 'sasha', loading: 'piko', empty: 'momo' } as const satisfies Record<string, CharacterKey>
