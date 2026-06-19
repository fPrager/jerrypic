import { promises as fs } from 'node:fs'
import getImagePaths from './getImagePaths.js'
import hashImageData from './hashImageData.js'
import loadImage from './loadImage.js'

/**
 * SHA-256 (hex) of a slug's stored image, or null if nothing is uploaded.
 * Reads the precomputed hash from the tiny sidecar (no image read); falls back
 * to hashing the bytes for older uploads whose sidecar predates the stored hash.
 */
const getImageHash = async (slug: string): Promise<string | null> => {
  try {
    const meta = JSON.parse(await fs.readFile(getImagePaths(slug).meta, 'utf8'))
    if (typeof meta.hash === 'string') return meta.hash
  } catch {
    // No/invalid sidecar — fall through to recompute from the image bytes.
  }

  const image = await loadImage(slug)
  return image ? hashImageData(image.data) : null
}

export default getImageHash
