import { createApp } from 'vue'
import { setThemeStorageKey } from 'rei-kit'
import App from './App.vue'
import { router } from './router'
import './assets/main.css'

// Before anything reads the theme: another rei-kit app on the same origin would share the key.
setThemeStorageKey('lugu-theme')

/*
 * After a deploy the hashed chunks of the old build are gone: an open tab then fails on
 * the next lazy import. Reload once to pick up the new index.html; the flag stops a loop.
 */
const RELOAD_FLAG = 'lugu:chunk-reload'
function reloadOnceForNewBuild(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0)
    if (Date.now() - last < 30_000) return false
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()))
  } catch {
    // No storage: reloading once is still right, a loop is unlikely since the new build has the chunks.
  }
  window.location.reload()
  return true
}
window.addEventListener('vite:preloadError', (e) => {
  if (reloadOnceForNewBuild()) e.preventDefault()
})

const app = createApp(App)
app.use(router)
router.isReady().then(() => app.mount('#app'))
// iOS only runs :active (the press feedback) when something listens for touch.
document.addEventListener('touchstart', () => {}, { passive: true })
