import { onMounted, onUnmounted } from 'vue'

/**
 * Put `data-area` on <html> while a shell is mounted.
 *
 * The area scope has to reach what teleports out of the shell — rei-kit's
 * drawer, sheet, toasts and menus mount under <body> — or an admin drawer
 * would open in the student palette. Off when two shells share a page (the
 * design gallery).
 */
export function useDocumentArea(area: 'student' | 'admin', enabled: () => boolean): void {
  onMounted(() => {
    if (enabled()) document.documentElement.dataset.area = area
  })
  onUnmounted(() => {
    if (enabled() && document.documentElement.dataset.area === area) delete document.documentElement.dataset.area
  })
}
