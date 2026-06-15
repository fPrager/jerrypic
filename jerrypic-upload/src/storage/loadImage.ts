import { promises as fs } from 'node:fs'
import getImagePaths from './getImagePaths.js'

export type StoredImage = {
  data: Buffer
  contentType: string
}

/** Load the image for a slug, or null if nothing has been uploaded yet. */
const loadImage = async (slug: string): Promise<StoredImage | null> => {
  const paths = getImagePaths(slug)

  let data: Buffer
  try {
    data = await fs.readFile(paths.image)
  } catch {
    return null
  }

  let contentType = 'application/octet-stream'
  try {
    const meta = JSON.parse(await fs.readFile(paths.meta, 'utf8'))
    if (typeof meta.contentType === 'string') contentType = meta.contentType
  } catch {
    // No/invalid sidecar — fall back to the generic type.
  }

  return { data, contentType }
}

export default loadImage
