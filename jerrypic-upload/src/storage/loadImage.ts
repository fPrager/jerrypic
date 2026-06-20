import { promises as fs } from 'node:fs'
import getImagePaths from './getImagePaths.js'
import loadMeta from './loadMeta.js'

export type StoredImage = {
  data: Buffer
  contentType: string
}

/** Load the image for a slug, or null if nothing has been uploaded yet. */
const loadImage = async (slug: string): Promise<StoredImage | null> => {
  let data: Buffer
  try {
    data = await fs.readFile(getImagePaths(slug).image)
  } catch {
    return null
  }

  const meta = await loadMeta(slug)
  return { data, contentType: meta?.contentType ?? 'application/octet-stream' }
}

export default loadImage
