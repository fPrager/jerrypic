import { promises as fs } from 'node:fs'
import getImagePaths from './getImagePaths.js'
import hashImageData from './hashImageData.js'

/** Store (or overwrite) the image for a slug. Latest upload wins. */
const saveImage = async (slug: string, data: Buffer, contentType: string): Promise<void> => {
  const paths = getImagePaths(slug)
  await fs.mkdir(paths.dir, { recursive: true })
  await fs.writeFile(paths.image, data)
  // Hash once here (bytes already in memory) so /hash never re-reads or re-hashes the image.
  await fs.writeFile(paths.meta, JSON.stringify({ contentType, hash: hashImageData(data) }))
}

export default saveImage
