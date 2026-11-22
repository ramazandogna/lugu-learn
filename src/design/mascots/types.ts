/**
 * The drawing contract every mascot follows.
 *
 * All five share one 120×120 viewBox, one outline weight and one shading
 * language (flat body, one shade crescent lower-right, one highlight upper-left,
 * a lighter belly), so they read as one family. A rig is the parts that differ;
 * the face and arms are drawn from shared expression rules so an expression
 * means the same thing on every character.
 */
export const EXPRESSIONS = ['happy', 'thinking', 'celebrating', 'encouraging', 'resting', 'surprised'] as const
export type Expression = (typeof EXPRESSIONS)[number]

/** Named paints; each character maps them to its own colours. */
export type Paint = 'body' | 'shade' | 'light' | 'accent' | 'gear' | 'cheek' | 'ink' | 'white'

export type MascotPalette = Record<Paint, string>

export interface Shape {
  d: string
  fill: Paint | 'none'
  /** Outlined in the character's ink at the family weight. */
  outline?: boolean
  /** A stroke in this paint instead of (or as well as) a fill. */
  stroke?: Paint
  strokeWidth?: number
  opacity?: number
}

export interface MascotRig {
  /** Behind the body: ears, tails, wings, manes. */
  back: readonly Shape[]
  /** The body itself, its shade, highlight and belly. */
  body: readonly Shape[]
  /** On the body, under the face: straps, bandanas, face discs. */
  front: readonly Shape[]
  /** Over the face: glasses, a hat brim. */
  over?: readonly Shape[]
  /** Midpoint between the eyes, the eye spacing, and an eye scale. */
  face: { x: number; y: number; gap: number; scale?: number }
  /** Shoulder points the arms start from. */
  arms: { left: readonly [number, number]; right: readonly [number, number] }
}
