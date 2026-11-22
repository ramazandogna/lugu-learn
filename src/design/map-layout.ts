/**
 * Geometry of the learning map: a winding path, not a list.
 *
 * Nodes sit on a sine meander (x in percent of the width, y in pixels), so
 * the same layout works at any width — a phone gets a narrow swing, a tablet
 * a wide one — and the path between them is drawn through the same points.
 */
export type MapNodeState = 'locked' | 'available' | 'in_progress' | 'completed'

export interface MapNode {
  id: string
  title: string
  sequence: number
  state: MapNodeState
}

export interface MapPoint {
  x: number
  y: number
}

/** The node the learner should go to next: in progress first, else the first available one. */
export function currentNodeId(nodes: readonly MapNode[]): string | undefined {
  return (nodes.find((n) => n.state === 'in_progress') ?? nodes.find((n) => n.state === 'available'))?.id
}

/** Nodes in path order. Sequence decides, never the array order. */
export function orderNodes(nodes: readonly MapNode[]): MapNode[] {
  return [...nodes].sort((a, b) => a.sequence - b.sequence)
}

export function mapPoints(count: number, { amplitude, rowHeight, top = 72 }: { amplitude: number; rowHeight: number; top?: number }): MapPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 50 + amplitude * Math.sin((i * Math.PI) / 3),
    y: top + i * rowHeight,
  }))
}

/** A smooth path through the points, with vertical handles so it reads as a trail. */
export function pathThrough(points: readonly MapPoint[]): string {
  const [first, ...rest] = points
  if (!first) return ''
  let d = `M${first.x.toFixed(2)} ${first.y}`
  let prev = first
  for (const p of rest) {
    const mid = (p.y - prev.y) / 2
    d += `C${prev.x.toFixed(2)} ${prev.y + mid} ${p.x.toFixed(2)} ${p.y - mid} ${p.x.toFixed(2)} ${p.y}`
    prev = p
  }
  return d
}

/** How far the "walked" part of the trail reaches: through the last completed node, or up to the current one. */
export function walkedCount(nodes: readonly MapNode[]): number {
  const current = nodes.findIndex((n) => n.state === 'in_progress' || n.state === 'available')
  if (current >= 0) return current + 1
  let last = -1
  nodes.forEach((n, i) => {
    if (n.state === 'completed') last = i
  })
  return last + 1
}
