import hashImageData from './hashImageData.js'
import loadImage from './loadImage.js'
import loadMeta from './loadMeta.js'

/**
 * SHA-256 (hex) of a slug's stored raw image, or null if nothing is uploaded.
 * Reads the precomputed hash from the tiny sidecar (no image read); falls back
 * to hashing the bytes for older uploads whose sidecar predates the stored hash.
 */
const getImageHash = async (slug: string): Promise<string | null> => {
  const meta = await loadMeta(slug)
  if (meta?.hash) return meta.hash

  const image = await loadImage(slug)
  return image ? hashImageData(image.data) : null
}

export default getImageHash
