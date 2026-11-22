import type { CharacterKey } from '@/domain/content'

import { doraPalette, doraRig } from './dora'
import { leoPalette, leoRig } from './leo'
import { momoPalette, momoRig } from './momo'
import { pikoPalette, pikoRig } from './piko'
import { sashaPalette, sashaRig } from './sasha'
import type { MascotPalette, MascotRig } from './types'

export { drawExpression, type ExpressionLayers } from './expressions'
export { EXPRESSIONS, type Expression, type MascotPalette, type MascotRig, type Paint, type Shape } from './types'

export const MASCOT_RIGS: Record<CharacterKey, MascotRig> = {
  piko: pikoRig,
  sasha: sashaRig,
  momo: momoRig,
  dora: doraRig,
  leo: leoRig,
}

export const MASCOT_PALETTES: Record<CharacterKey, MascotPalette> = {
  piko: pikoPalette,
  sasha: sashaPalette,
  momo: momoPalette,
  dora: doraPalette,
  leo: leoPalette,
}
