import type { StepDefinition } from '../types.js'
import resize from './resize.js'
import rotate from './rotate.js'
import flip from './flip.js'
import crop from './crop.js'
import autocrop from './autocrop.js'
import greyscale from './greyscale.js'
import invert from './invert.js'
import contrast from './contrast.js'
import brightness from './brightness.js'
import normalize from './normalize.js'
import threshold from './threshold.js'
import dither from './dither.js'
import format from './format.js'

// Order here is the order shown in the editor's "add step" picker.
export const STEP_LIST: readonly StepDefinition[] = [
  resize,
  rotate,
  flip,
  crop,
  autocrop,
  greyscale,
  invert,
  contrast,
  brightness,
  normalize,
  threshold,
  dither,
  format,
]

const registry: Record<string, StepDefinition> = Object.fromEntries(STEP_LIST.map((step) => [step.type, step]))

export default registry
