import { promises as fs } from 'node:fs'
import getImagePaths from './getImagePaths.js'
import type { Step } from '../pipeline/index.js'

/** The sidecar stored next to each image: content type, hash, raw dimensions, and the pipeline. */
export type ImageMeta = {
  contentType?: string
  hash?: string
  width?: number
  height?: number
  pipeline?: Step[]
}

/** Read and parse a slug's meta sidecar, or null if it doesn't exist / is invalid. */
const loadMeta = async (slug: string): Promise<ImageMeta | null> => {
  try {
    return JSON.parse(await fs.readFile(getImagePaths(slug).meta, 'utf8')) as ImageMeta
  } catch {
    return null
  }
}

export default loadMeta
