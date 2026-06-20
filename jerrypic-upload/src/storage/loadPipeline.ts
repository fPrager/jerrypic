import { defaultPipeline, validatePipeline } from '../pipeline/index.js'
import type { Step } from '../pipeline/index.js'
import loadMeta from './loadMeta.js'

/** The stored, normalized pipeline for a slug, or the default if none is saved. */
const loadPipeline = async (slug: string): Promise<Step[]> => {
  const meta = await loadMeta(slug)
  return validatePipeline(meta?.pipeline ?? defaultPipeline())
}

export default loadPipeline
