import { onBeforeUnmount, onMounted, ref, readonly } from 'vue'

/** True while the user asks for reduced motion. Reactive; SSR/test safe. */
export function useReducedMotion() {
  const reduced = ref(false)
  let mq: MediaQueryList | undefined
  const sync = () => {
    reduced.value = !!mq?.matches
  }
  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    sync()
    mq.addEventListener?.('change', sync)
  })
  onBeforeUnmount(() => mq?.removeEventListener?.('change', sync))
  return readonly(reduced)
}

/** True while the tab is visible; ambient motion pauses when it is not. */
export function usePageVisible() {
  const visible = ref(true)
  const sync = () => {
    visible.value = typeof document === 'undefined' || document.visibilityState !== 'hidden'
  }
  onMounted(() => {
    sync()
    document.addEventListener('visibilitychange', sync)
  })
  onBeforeUnmount(() => document.removeEventListener('visibilitychange', sync))
  return readonly(visible)
}

/** Ambient budget per screen (design-bible D): floating candies at most 5. */
export const AMBIENT_MAX_CANDIES = 5
