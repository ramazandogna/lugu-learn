/**
 * What the lesson's wow moments know about the learner's history (wow-pass C):
 * how many lessons were opened (doses shrink as the child gets used to them),
 * which sessions already had their opening, and the last few lessons' numbers
 * for the finale's "geçen derse göre". All in `localStorage` `lugu.wow.seen`,
 * every read and write guarded: without storage the full-length versions play.
 */
import type { SectionKey } from '@/domain/content'

const KEY = 'lugu.wow.seen'

export interface LessonNumbers {
  words: number
  best: number
}
interface Seen {
  /** Session ids whose opening scene already played. */
  ids: string[]
  /** Lessons opened so far. */
  lessons: number
  /** Numbers of the last finished lessons, newest last (at most 5). */
  history: LessonNumbers[]
}

function read(): Seen {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Seen> | null
    return {
      ids: Array.isArray(raw?.ids) ? raw.ids.filter((x): x is string => typeof x === 'string').slice(-50) : [],
      lessons: typeof raw?.lessons === 'number' ? raw.lessons : 0,
      history: Array.isArray(raw?.history) ? raw.history.slice(-5) : [],
    }
  } catch {
    return { ids: [], lessons: 0, history: [] }
  }
}
function write(s: Seen) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private mode: the wow just plays in full next time */
  }
}

/** Opening scene (C1): once per session; null = skip. 2400 ms, 1200 ms after the 5th lesson. */
export function openingFor(sessionId: string, resumed: boolean): { ms: number } | null {
  const s = read()
  if (resumed || s.ids.includes(sessionId)) return null
  const ms = s.lessons >= 5 ? 1200 : 2400
  write({ ...s, ids: [...s.ids, sessionId], lessons: s.lessons + 1 })
  return { ms }
}

/** Section card (C2): 1200 ms, 700 ms from the 4th lesson on. */
export function sectionCardMs(): number {
  return read().lessons >= 4 ? 700 : 1200
}

/** The previous lessons' numbers (before this one is recorded). */
export function previousLessons(): LessonNumbers[] {
  return read().history
}

export function recordLesson(n: LessonNumbers) {
  const s = read()
  write({ ...s, history: [...s.history, n].slice(-5) })
}

/* ----- words ----- */

/** Piko's one-line goal for a section (C2). */
export const SECTION_GOAL: Record<SectionKey, string> = {
  review: 'Eski bilgilerini ısındır.',
  vocabulary: 'Yeni kelimelerle tanış.',
  vocab_quiz: 'Kelimeleri oyunla pekiştir.',
  story: 'Hikâyeyi oku, kararı sen ver.',
  explanation: 'Kuralı küçük adımlarla keşfet.',
  homework: 'Cümleleri kendin kur.',
  assessment: 'Bugün öğrendiklerini göster.',
}

/** Three Piko lines per section, taken in turn so the same card is not said twice in a row. */
export const SECTION_PIKO: Record<SectionKey, readonly [string, string, string]> = {
  review: ['Biraz ısınalım, acele yok.', 'Eskiler hâlâ aklında mı? Bakalım!', 'Isınma turu, yanlışı yok.'],
  vocabulary: ['Kartları çevir, şekerleri topla!', 'Her kelime bir şeker, hepsini alalım.', 'Sesini dinle, sonra söyle.'],
  vocab_quiz: ['Şimdi şekerleri mühürleyelim.', 'Kelimeler cebinde, hadi deneyelim.', 'Bildiğini göster, bilmediğini öğren.'],
  story: ['Hikâye zamanı, ben yanındayım.', 'Kimin sandviçi kayıp? Birlikte bulalım.', 'Okurken takılırsan dokun, açıklarım.'],
  explanation: ['Küçük adım, büyük fikir.', 'Kural aslında çok basit, göreceksin.', 'Her adımda bir ipucu saklı.'],
  homework: ['Parçalar hazır, cümleyi sen kur.', 'Tamamla, sırala, anlamını bul.', 'Takılırsan ipucu hep burada.'],
  assessment: ['Son tur! Sakin sakin düşün.', 'Ne öğrendiğini göstermenin tam zamanı.', 'İstediğin kadar düşün, süre yok.'],
}

/** What a finished section says in the little celebration (C5). Never counts mistakes. */
export function doneLine(section: SectionKey, newWords: number): string {
  switch (section) {
    case 'vocabulary':
    case 'vocab_quiz':
      return newWords > 0 ? `${newWords} yeni kelime öğrendin` : 'Kelimeleri tekrar ettin'
    case 'story':
      return 'Hikâyeyi sonuna kadar okudun'
    case 'explanation':
      return 'Yeni kuralı keşfettin'
    case 'homework':
      return 'Cümleleri kendin kurdun'
    case 'review':
      return 'Isındın, hazırsın'
    case 'assessment':
      return 'Bugünkü işi bitirdin'
  }
}
