import { validatePipeline } from '../pipeline/index.js'
import type { Step } from '../pipeline/index.js'
import loadMeta from './loadMeta.js'
import writeMeta from './writeMeta.js'

/** Validate and persist a slug's pipeline, keeping the rest of the sidecar. Returns the normalized steps. */
const savePipeline = async (slug: string, raw: unknown): Promise<Step[]> => {
  const pipeline = validatePipeline(raw)
  const existing = (await loadMeta(slug)) ?? {}
  await writeMeta(slug, { ...existing, pipeline })
  return pipeline
}

export default savePipeline
