/**
 * Expressions as shared rules over a rig's anchors.
 *
 * An expression is a face (eyes, brows, mouth, cheeks), an arm pose and a few
 * extras. Because every character draws them from the same rules, "thinking"
 * looks like thinking on Piko and on Leo, and a new expression is added once.
 */
import { circle, ellipse, sparkle, star } from './geometry'
import type { Expression, MascotRig, Shape } from './types'

type Pose = 'down' | 'up' | 'wave' | 'chin' | 'fold' | 'open'
type Eyes = 'open' | 'look' | 'joy' | 'sleep' | 'wide'
type Mouth = 'smile' | 'cheer' | 'hmm' | 'grin' | 'calm' | 'oh'

interface Recipe {
  eyes: Eyes
  mouth: Mouth
  arms: readonly [Pose, Pose]
  brows?: 'raised' | 'think'
}

const RECIPES: Record<Expression, Recipe> = {
  happy: { eyes: 'open', mouth: 'smile', arms: ['down', 'down'] },
  thinking: { eyes: 'look', mouth: 'hmm', arms: ['down', 'chin'], brows: 'think' },
  celebrating: { eyes: 'joy', mouth: 'cheer', arms: ['up', 'up'] },
  encouraging: { eyes: 'open', mouth: 'grin', arms: ['down', 'wave'], brows: 'raised' },
  resting: { eyes: 'sleep', mouth: 'calm', arms: ['fold', 'fold'] },
  surprised: { eyes: 'wide', mouth: 'oh', arms: ['open', 'open'], brows: 'raised' },
}

const line = (d: string, w = 2.8): Shape => ({ d, fill: 'none', stroke: 'ink', strokeWidth: w })

function eyeShapes(kind: Eyes, ex: number, ey: number, s: number): Shape[] {
  switch (kind) {
    case 'open':
      return [{ d: ellipse(ex, ey, 3.4 * s, 4.4 * s), fill: 'ink' }, { d: circle(ex + 1.2 * s, ey - 1.6 * s, 1.3 * s), fill: 'white' }]
    case 'look':
      return [{ d: ellipse(ex + 1.2, ey - 1.2, 3.4 * s, 4.4 * s), fill: 'ink' }, { d: circle(ex + 2.4 * s, ey - 2.8 * s, 1.3 * s), fill: 'white' }]
    case 'wide':
      return [{ d: circle(ex, ey, 4.6 * s), fill: 'ink' }, { d: circle(ex + 1.5 * s, ey - 1.8 * s, 1.6 * s), fill: 'white' }]
    case 'joy':
      return [line(`M${ex - 4 * s} ${ey + 1.5}Q${ex} ${ey - 4.5 * s} ${ex + 4 * s} ${ey + 1.5}`)]
    case 'sleep':
      return [line(`M${ex - 4 * s} ${ey}Q${ex} ${ey + 3.6 * s} ${ex + 4 * s} ${ey}`)]
  }
}

function mouthShape(kind: Mouth, x: number, my: number): Shape[] {
  switch (kind) {
    case 'smile':
      return [line(`M${x - 6} ${my}Q${x} ${my + 6} ${x + 6} ${my}`)]
    case 'cheer':
      return [
        { d: `M${x - 7} ${my - 1}Q${x} ${my + 12} ${x + 7} ${my - 1}Z`, fill: 'ink' },
        { d: ellipse(x, my + 4.6, 3.2, 1.8), fill: 'cheek' },
      ]
    case 'grin':
      return [{ d: `M${x - 6.5} ${my}Q${x} ${my + 8} ${x + 6.5} ${my}Z`, fill: 'ink' }]
    case 'hmm':
      return [line(`M${x - 3} ${my + 1}Q${x + 1} ${my - 1.5} ${x + 5} ${my + 0.6}`)]
    case 'calm':
      return [line(`M${x - 3} ${my}Q${x} ${my + 2.6} ${x + 3} ${my}`, 2.4)]
    case 'oh':
      return [{ d: ellipse(x, my + 2, 2.8, 3.4), fill: 'ink' }]
  }
}

function browShapes(kind: Recipe['brows'], lx: number, rx: number, by: number): Shape[] {
  if (kind === 'raised')
    return [line(`M${lx - 4} ${by}Q${lx} ${by - 3} ${lx + 4} ${by - 1}`, 2.2), line(`M${rx - 4} ${by - 1}Q${rx} ${by - 3} ${rx + 4} ${by}`, 2.2)]
  if (kind === 'think') return [line(`M${lx - 4} ${by}L${lx + 4} ${by}`, 2.2), line(`M${rx - 4} ${by - 1}Q${rx} ${by - 5} ${rx + 4} ${by - 2}`, 2.2)]
  return []
}

function armEnd(pose: Pose, side: -1 | 1, [ax, ay]: readonly [number, number], rig: MascotRig): [number, number, number, number] {
  const s = rig.face.scale ?? 1
  switch (pose) {
    case 'down':
      return [ax + side * 6, ay + 6, ax + side * 3, ay + 13]
    case 'up':
      return [ax + side * 12, ay - 6, ax + side * 10, ay - 22]
    case 'wave':
      return [ax + side * 14, ay - 2, ax + side * 13, ay - 16]
    case 'open':
      return [ax + side * 10, ay, ax + side * 13, ay - 6]
    case 'chin':
      return [ax + side * 2, ay + 6, rig.face.x + side * 7, rig.face.y + 14 * s]
    case 'fold':
      return [ax, ay + 10, ax - side * 9, ay + 9]
  }
}

function arm(pose: Pose, side: -1 | 1, rig: MascotRig): Shape[] {
  const start = side === -1 ? rig.arms.left : rig.arms.right
  const [cx, cy, ex, ey] = armEnd(pose, side, start, rig)
  const d = `M${start[0]} ${start[1]}Q${cx} ${cy} ${ex} ${ey}`
  return [
    { d, fill: 'none', stroke: 'ink', strokeWidth: 10 },
    { d, fill: 'none', stroke: 'body', strokeWidth: 5.4 },
  ]
}

function extras(expression: Expression, rig: MascotRig): Shape[] {
  switch (expression) {
    case 'thinking':
      return [
        { d: circle(94, 30, 2.2), fill: 'light', outline: true },
        { d: circle(101, 21, 3.2), fill: 'light', outline: true },
        { d: circle(109, 10, 4.4), fill: 'light', outline: true },
      ]
    case 'celebrating':
      return [
        { d: sparkle(15, 32, 7), fill: 'accent', outline: true },
        { d: sparkle(106, 30, 6), fill: 'accent', outline: true },
        { d: sparkle(100, 6, 3.6), fill: 'accent' },
      ]
    case 'encouraging': {
      const [ax, ay] = rig.arms.right
      return [{ d: star(ax + 19, ay - 25, 6), fill: 'accent', outline: true }]
    }
    case 'resting':
      return [line('M94 28h8l-8 9h8', 2.4), line('M106 12h6l-6 7h6', 2)]
    case 'surprised':
      return [line('M14 40l6 4', 2.4), line('M12 52h7', 2.4), line('M106 40l-6 4', 2.4), line('M108 52h-7', 2.4)]
    case 'happy':
      return []
  }
}

export interface ExpressionLayers {
  /** Eyes, separated so they can blink. */
  eyes: Shape[]
  face: Shape[]
  arms: Shape[]
  extras: Shape[]
  /** Whether the eyes are open (and so may blink). */
  canBlink: boolean
}

export function drawExpression(rig: MascotRig, expression: Expression): ExpressionLayers {
  const recipe = RECIPES[expression]
  const { x, y, gap } = rig.face
  const s = rig.face.scale ?? 1
  const lx = x - gap / 2
  const rx = x + gap / 2
  return {
    eyes: [...eyeShapes(recipe.eyes, lx, y, s), ...eyeShapes(recipe.eyes, rx, y, s)],
    face: [
      { d: ellipse(lx - 5, y + 8 * s, 4.4, 2.6), fill: 'cheek', opacity: 0.55 },
      { d: ellipse(rx + 5, y + 8 * s, 4.4, 2.6), fill: 'cheek', opacity: 0.55 },
      ...browShapes(recipe.brows, lx, rx, y - 9 * s),
      ...mouthShape(recipe.mouth, x, y + 9 * s),
    ],
    arms: [...arm(recipe.arms[0], -1, rig), ...arm(recipe.arms[1], 1, rig)],
    extras: extras(expression, rig),
    canBlink: recipe.eyes === 'open' || recipe.eyes === 'look' || recipe.eyes === 'wide',
  }
}
