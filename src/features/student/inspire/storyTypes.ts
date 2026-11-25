/*
 * Hikâye Rafı veri şekli (wow-pass B3). Hepsi geçerli seçim, yanlış yok, süre yok.
 * `{pick:<choiceId>}` yer tutucusu seçilen şıkkın en/tr metniyle dolar.
 */
export type Gender = 'he' | 'she' | 'it'
export interface Line {
  en: string
  tr: string
}
/** `glyph` is a key of GLYPHS (glyphs.ts). */
export interface Cast {
  id: string
  name: string
  gender: Gender
  glyph: string
}
export interface Option {
  id: string
  en: string
  tr: string
  /** What the next frame says after this pick. */
  result: Line
}
export interface Choice {
  id: string
  prompt: Line
  options: readonly Option[]
}
export interface Frame {
  id: string
  beat: 'hook' | 'problem' | 'choice' | 'result' | 'payoff'
  /** Key of the scene backdrop (a Motif). */
  scene: 'ocean' | 'blossom' | 'sunshine' | 'dream' | 'courage'
  speaker: 'narrator' | string
  line: Line
  choice?: Choice
  /** A result frame shows the `result` of the option picked in this choice. */
  from?: string
}
export interface Story {
  id: string
  worldId: string
  title: Line
  cast: readonly Cast[]
  frames: readonly Frame[]
  /** `can` is the English the learner just handled; `tr` the "İngilizce bildiğin için ..." line. */
  proud: { can: Line; tr: string }
  souvenir: { id: string; name: string; glyph: string }
  /** The last choice decides the ending: one ending per option. */
  endings: number
  /** A pretend scene with a pretend person: frame 1 says so out loud. */
  simulation?: boolean
}
export interface StoryProgress {
  frame: number
  picks: Record<string, string>
  done: boolean
  endingsSeen: string[]
  at: string
}
