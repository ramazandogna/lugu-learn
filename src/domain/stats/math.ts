/**
 * Saf istatistik yardımcıları (spec 1 "Matematik"). Yuvarlama yok; boş/geçersiz girdide null.
 */

export function sumOf<T>(xs: readonly T[], f: (x: T) => number): number {
  let s = 0
  for (const x of xs) s += f(x)
  return s
}

export function sum(xs: readonly number[]): number {
  return sumOf(xs, x => x)
}

/** n=0 -> null. */
export function mean(xs: readonly number[]): number | null {
  return xs.length === 0 ? null : sum(xs) / xs.length
}

/** Örneklem sd. n<2 -> null. */
export function sd(xs: readonly number[]): number | null {
  const n = xs.length
  if (n < 2) return null
  const m = sum(xs) / n
  let acc = 0
  for (const x of xs) acc += (x - m) ** 2
  return Math.sqrt(acc / (n - 1))
}

/** x = 0..n-1 (eşit aralık) üzerinde en küçük kareler eğimi. n<2 -> null. */
export function slope(ys: readonly number[]): number | null {
  const n = ys.length
  if (n < 2) return null
  const xm = (n - 1) / 2
  const ym = sum(ys) / n
  let num = 0
  let den = 0
  for (const [i, y] of ys.entries()) {
    num += (i - xm) * (y - ym)
    den += (i - xm) ** 2
  }
  return den === 0 ? null : num / den
}

/** (v - mean(ref)) / max(sd(ref), floor). Referans yetersizse null. */
export function z(v: number, ref: readonly number[], floor: number): number | null {
  const m = mean(ref)
  const s = sd(ref)
  if (m === null || s === null) return null
  return (v - m) / Math.max(s, floor)
}

/** Doğrusal aradeğer. n=0 -> null. */
export function quantile(xs: readonly number[], q: number): number | null {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const pos = (s.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  const a = s[lo] ?? 0
  const b = s[hi] ?? 0
  return a + (b - a) * (pos - lo)
}

export function median(xs: readonly number[]): number | null {
  return quantile(xs, 0.5)
}

/** b=0 veya b/a null/NaN -> null. */
export function safeDiv(a: number | null, b: number | null): number | null {
  if (a === null || b === null || b === 0 || Number.isNaN(a) || Number.isNaN(b)) return null
  return a / b
}

/** from<=0 -> null; yoksa (to-from)/from*100. */
export function pctChange(from: number | null, to: number | null): number | null {
  if (from === null || to === null || from <= 0) return null
  return ((to - from) / from) * 100
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x))
}

export function nonNull<T>(x: T | null): x is T {
  return x !== null
}

/** Azalan sıralama comparator'ü; null değerler sona. */
export function descNullLast(a: number | null | undefined, b: number | null | undefined): number {
  const av = a ?? null
  const bv = b ?? null
  if (av === null) return bv === null ? 0 : 1
  if (bv === null) return -1
  return bv - av
}

/** Ardışık çiftler: [x0,x1], [x1,x2], ... */
export function pairwise<T>(xs: readonly T[]): [T, T][] {
  const out: [T, T][] = []
  for (let i = 1; i < xs.length; i++) {
    const a = xs[i - 1]
    const b = xs[i]
    if (a !== undefined && b !== undefined) out.push([a, b])
  }
  return out
}

/**
 * Sondan geriye ardışık adımları sayar. ok(sonraki, önceki) sağlandıkça devam eder.
 * Örn. düşüş: ok = (later, earlier) => later < earlier.
 */
export function consecutive(xs: readonly number[], ok: (later: number, earlier: number) => boolean): number {
  let c = 0
  for (let i = xs.length - 1; i >= 1; i--) {
    const later = xs[i]
    const earlier = xs[i - 1]
    if (later === undefined || earlier === undefined || !ok(later, earlier)) break
    c++
  }
  return c
}

export function groupBy<T, K>(xs: readonly T[], key: (x: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>()
  for (const x of xs) {
    const k = key(x)
    const g = m.get(k)
    if (g) g.push(x)
    else m.set(k, [x])
  }
  return m
}
