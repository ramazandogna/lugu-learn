/** Small path builders, so rigs read as shapes rather than as path soup. */

const n = (v: number) => Math.round(v * 100) / 100

export function circle(cx: number, cy: number, r: number): string {
  return ellipse(cx, cy, r, r)
}

export function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(rx * 2)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-rx * 2)} 0Z`
}

/** A four-pointed sparkle centred on (cx, cy). */
export function sparkle(cx: number, cy: number, r: number): string {
  const w = r * 0.28
  return `M${n(cx)} ${n(cy - r)}Q${n(cx + w)} ${n(cy - w)} ${n(cx + r)} ${n(cy)}Q${n(cx + w)} ${n(cy + w)} ${n(cx)} ${n(cy + r)}Q${n(cx - w)} ${n(cy + w)} ${n(cx - r)} ${n(cy)}Q${n(cx - w)} ${n(cy - w)} ${n(cx)} ${n(cy - r)}Z`
}

/** A five-pointed star with softened points. */
export function star(cx: number, cy: number, outer: number, inner = outer * 0.48): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}`)
  }
  return `M${pts.join('L')}Z`
}

/** A ring of rounded spikes, for a mane or a sun. */
export function spikes(cx: number, cy: number, outer: number, inner: number, count: number): string {
  let d = ''
  for (let i = 0; i < count; i += 1) {
    const a0 = (i / count) * Math.PI * 2 - Math.PI / 2
    const a1 = ((i + 0.5) / count) * Math.PI * 2 - Math.PI / 2
    const a2 = ((i + 1) / count) * Math.PI * 2 - Math.PI / 2
    if (i === 0) d += `M${n(cx + inner * Math.cos(a0))} ${n(cy + inner * Math.sin(a0))}`
    d += `Q${n(cx + outer * Math.cos(a1))} ${n(cy + outer * Math.sin(a1))} ${n(cx + inner * Math.cos(a2))} ${n(cy + inner * Math.sin(a2))}`
  }
  return `${d}Z`
}

/** Mirror a path's x coordinates around `axis` (the mascot viewBox centre by default). Absolute commands only. */
export function mirror(d: string, axis = 60): string {
  return d.replace(/([MLQCTS])([^MLQCTSZaA]*)/g, (_, cmd: string, args: string) => {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number)
    const out = nums.map((v, i) => (i % 2 === 0 ? n(axis * 2 - v) : v))
    return `${cmd}${out.join(' ')}`
  })
}
