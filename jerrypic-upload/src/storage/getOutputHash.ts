import { buildSizedPipeline } from '../pipeline/index.js'
import type { RequestedSize } from '../pipeline/index.js'
import getImageHash from './getImageHash.js'
import hashImageData from './hashImageData.js'
import loadPipeline from './loadPipeline.js'

/**
 * Hash that changes whenever the rendered output would: a digest of the raw
 * image hash combined with the pipeline definition. Lets the Kindle poll cheaply
 * and re-download when either the photo or the steps change. Null if no image.
 */
const getOutputHash = async (slug: string, requestedSize: RequestedSize | null = null): Promise<string | null> => {
  const rawHash = await getImageHash(slug)
  if (!rawHash) return null

  const pipeline = buildSizedPipeline(await loadPipeline(slug), requestedSize)
  return hashImageData(`${rawHash}:${JSON.stringify(pipeline)}`)
}

export default getOutputHash
