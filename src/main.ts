import { createApp } from 'vue'
import { setThemeStorageKey } from 'rei-kit'
import App from './App.vue'
import { router } from './router'
import './assets/main.css'

// Before anything reads the theme: another rei-kit app on the same origin would share the key.
setThemeStorageKey('lugu-theme')

const app = createApp(App)
app.use(router)
router.isReady().then(() => app.mount('#app'))
// iOS only runs :active (the press feedback) when something listens for touch.
document.addEventListener('touchstart', () => {}, { passive: true })
