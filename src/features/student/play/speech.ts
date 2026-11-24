/** Read-aloud through the Web Speech API. No API = no button (callers hide it). Never throws. */
export const speechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

export type SpeakRate = 'normal' | 'slow'

export function speak(text: string, rate: SpeakRate = 'normal', lang = 'en-US'): void {
  if (!speechSupported()) return
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = rate === 'slow' ? 0.65 : 0.95
    u.volume = 0.85
    synth.speak(u)
  } catch {
    /* a failed read-aloud is never an error for the learner */
  }
}

export function stopSpeaking(): void {
  try {
    if (speechSupported()) window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}
