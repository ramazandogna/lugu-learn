/**
 * Human labels for ids inside a stored package. Reads the document loosely:
 * history must stay readable even for a revision an older schema produced.
 */
export interface PackageLabels {
  vocab: Map<string, string>
  questions: Map<string, string>
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const at = (v: unknown, ...path: string[]): unknown => path.reduce<unknown>((o, k) => (isObj(o) ? o[k] : undefined), v)

export function packageLabels(content: unknown): PackageLabels {
  const vocab = new Map<string, string>()
  const questions = new Map<string, string>()
  for (const v of arr(at(content, 'vocabulary')))
    if (isObj(v) && typeof v.id === 'string') vocab.set(v.id, `${String(v.en ?? v.id)} — ${String(v.tr ?? '')}`)
  const addQ = (q: unknown) => {
    if (isObj(q) && typeof q.id === 'string') questions.set(q.id, String(q.prompt ?? q.id))
  }
  arr(at(content, 'review', 'questions')).forEach(addQ)
  arr(at(content, 'story', 'questions')).forEach(addQ)
  arr(at(content, 'explanation', 'steps')).forEach((s) => addQ(at(s, 'check')))
  arr(at(content, 'homework', 'groups')).forEach((g) => ['complete', 'order', 'meaning'].forEach((k) => addQ(at(g, k))))
  arr(at(content, 'assessment', 'quiz')).forEach(addQ)
  arr(at(content, 'assessment', 'reading', 'questions')).forEach(addQ)
  return { vocab, questions }
}

/** Merges the labels of several packages (ids are only unique per package, so the first wins). */
export function mergedLabels(contents: Iterable<unknown>): PackageLabels {
  const out: PackageLabels = { vocab: new Map(), questions: new Map() }
  for (const c of contents) {
    const l = packageLabels(c)
    l.vocab.forEach((v, k) => out.vocab.has(k) || out.vocab.set(k, v))
    l.questions.forEach((v, k) => out.questions.has(k) || out.questions.set(k, v))
  }
  return out
}

export const labelFor = (labels: PackageLabels, id: string) => labels.questions.get(id) ?? labels.vocab.get(id) ?? id
