/** Read an English line aloud with the browser voice, when there is one. Never throws. */
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

export function speak(text: string, slow = false): void {
  if (!canSpeak()) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text.replace(/_{2,}/g, ' '))
    u.lang = 'en-US'
    u.rate = slow ? 0.65 : 0.9
    u.volume = 0.8
    window.speechSynthesis.speak(u)
  } catch {
    /* no voice available: the text is still on screen */
  }
}

export function stopSpeaking(): void {
  try {
    if (canSpeak()) window.speechSynthesis.cancel()
  } catch {
    /* nothing to stop */
  }
}
