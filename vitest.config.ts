import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

export default defineConfig({
  test: {
    projects: [
      { plugins: [vue()], resolve: { alias }, test: { name: 'unit', include: ['src/**/*.test.ts'], environment: 'jsdom' } },
      // Applies every migration to an in-process Postgres (PGlite) and checks RLS as real roles.
      // AI pipeline core with a mocked model client: no network, no key.
      { resolve: { alias }, test: { name: 'ai', include: ['tests/ai/**/*.test.ts'], environment: 'node' } },
      { resolve: { alias }, test: { name: 'db', include: ['tests/db/**/*.test.ts'], environment: 'node', testTimeout: 60_000, hookTimeout: 120_000 } },
    ],
  },
})
