import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue'
import type { LessonPackage } from '@/domain/content'
import { collectIds, slugId } from '../../lib/package-edit'

interface EditorContext {
  newId: (seed: string, prefix: string) => string
  objectiveOptions: ComputedRef<{ value: string; label: string }[]>
  vocabOptions: ComputedRef<{ value: string; label: string }[]>
}

const KEY: InjectionKey<EditorContext> = Symbol('package-editor')

export function provideEditor(pkg: () => LessonPackage): EditorContext {
  const ctx: EditorContext = {
    newId: (seed, prefix) => slugId(seed || prefix, collectIds(pkg()), prefix),
    objectiveOptions: computed(() => pkg().meta.objectives.map((o) => ({ value: o.id, label: `${o.id} · ${o.text}` }))),
    vocabOptions: computed(() => pkg().vocabulary.map((v) => ({ value: v.id, label: `${v.en} — ${v.tr}` }))),
  }
  provide(KEY, ctx)
  return ctx
}

export function useEditor(): EditorContext {
  const ctx = inject(KEY)
  if (!ctx) throw new Error('useEditor outside PackageEditor')
  return ctx
}

export const CHARACTER_OPTIONS = [
  { value: 'piko' as const, label: 'Piko' },
  { value: 'sasha' as const, label: 'Sasha' },
  { value: 'momo' as const, label: 'Momo' },
  { value: 'dora' as const, label: 'Dora' },
  { value: 'leo' as const, label: 'Leo' },
]

/** One item per line, empty lines dropped. */
export const toLines = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
