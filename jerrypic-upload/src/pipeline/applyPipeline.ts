import { Jimp } from 'jimp'
import registry from './steps/index.js'
import type { Step } from './types.js'

/**
 * Decode the image once, fold the transform steps over it, then encode via the
 * target step. Assumes `steps` has been normalized by validatePipeline (so a
 * target step is present), but falls back to the registry's target if not.
 */
const applyPipeline = async (data: Buffer, steps: Step[]): Promise<{ buffer: Buffer; contentType: string }> => {
  const image = await Jimp.read(data)
  let target: Step | null = null

  for (const step of steps) {
    const def = registry[step.type]
    if (!def) continue
    if (def.isTarget) target = step
    else def.apply?.(image, step.params)
  }

  const targetDef = (target && registry[target.type]) || Object.values(registry).find((def) => def.isTarget)
  return targetDef!.encode!(image, target?.params ?? {})
}

export default applyPipeline
