/**
 * Leaving an unfinished lesson: a friendly word first (brief §14), never a
 * threat, and progress is already on the server so the learner can return.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, type RouteLocationRaw, useRouter } from 'vue-router'

export const LEAVE_TITLE = 'Henüz dersini tamamlamadın!'
export const LEAVE_MESSAGE =
  'Bugünkü maceranı tamamlamanı öneriyoruz. Şimdi ayrılırsan dersin tamamlanmamış olarak kaydedilecek. İstersen kaldığın yerden geri dönebilirsin.'

export function useLeaveGuard(opts: { active: () => boolean; onWarn: () => void; beforeLeave: () => Promise<void> }) {
  const router = useRouter()
  const asking = ref(false)
  let target: RouteLocationRaw | null = null
  let allowed = false

  onBeforeRouteLeave((to) => {
    if (allowed || !opts.active()) return true
    target = to.fullPath
    asking.value = true
    opts.onWarn()
    return false
  })

  function onUnload(e: BeforeUnloadEvent) {
    if (!opts.active()) return
    e.preventDefault()
    // Older browsers show this text; newer ones show their own wording.
    e.returnValue = LEAVE_MESSAGE
  }

  onMounted(() => window.addEventListener('beforeunload', onUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onUnload))

  async function leave() {
    asking.value = false
    await opts.beforeLeave()
    allowed = true
    await router.push(target ?? '/')
  }

  function stay() {
    asking.value = false
    target = null
  }

  return { asking, leave, stay }
}
