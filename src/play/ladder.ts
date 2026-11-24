/** Shared wrong-answer ladder and difficulty drop (patterns.md common rules). Wording stays gentle: "Yaklaştın!". */
export type WrongStage = 'retry' | 'piko-help' | 'reveal-and-requeue'

/** `wrongCount` = wrong answers so far on the SAME question (1-based after the wrong answer). */
export function wrongStage(wrongCount: number): WrongStage {
  if (wrongCount >= 3) return 'reveal-and-requeue'
  if (wrongCount === 2) return 'piko-help'
  return 'retry'
}

/** Requeue window for a revealed question: same day, within 30 minutes. */
export const REQUEUE_WINDOW_MS = 30 * 60_000

/** 3 wrong in a row lowers difficulty one level (silently). Returns the new level (min 0). */
export function nextDifficulty(level: number, consecutiveWrong: number): number {
  return consecutiveWrong >= 3 ? Math.max(0, level - 1) : level
}
