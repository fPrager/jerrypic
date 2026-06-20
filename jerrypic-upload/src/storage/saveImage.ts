import { promises as fs } from 'node:fs'
import { Jimp } from 'jimp'
import getImagePaths from './getImagePaths.js'
import hashImageData from './hashImageData.js'
import loadMeta from './loadMeta.js'
import writeMeta from './writeMeta.js'

// Decode just to read the source dimensions, so the editor can default a resize
// step to the raw size. Undecodable uploads (e.g. AVIF) simply have no dims.
const readDimensions = async (data: Buffer): Promise<{ width?: number; height?: number }> => {
  try {
    const { bitmap } = await Jimp.read(data)
    return { width: bitmap.width, height: bitmap.height }
  } catch {
    return {}
  }
}

/** Store (or overwrite) the image for a slug, preserving its saved pipeline. Latest upload wins. */
const saveImage = async (slug: string, data: Buffer, contentType: string): Promise<void> => {
  const paths = getImagePaths(slug)
  await fs.mkdir(paths.dir, { recursive: true })
  await fs.writeFile(paths.image, data)

  const existing = (await loadMeta(slug)) ?? {}
  const { width, height } = await readDimensions(data)
  // Hash once here (bytes already in memory); keep any existing pipeline setting.
  await writeMeta(slug, { ...existing, contentType, hash: hashImageData(data), width, height })
}

export default saveImage
