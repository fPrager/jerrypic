import type { Step } from './types.js'

/**
 * The steps a slug starts with: today's hardcoded behavior (greyscale, rotate)
 * expressed as editable steps, plus the JPEG target. No device resolution is
 * baked in — add a resize step for that.
 */
const defaultPipeline = (): Step[] => [
  { type: 'greyscale', params: {} },
  { type: 'rotate', params: { deg: -90 } },
  { type: 'format', params: { format: 'jpeg', quality: 80 } },
]

export default defaultPipeline
