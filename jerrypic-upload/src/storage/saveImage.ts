import { promises as fs } from 'node:fs'
import getImagePaths from './getImagePaths.js'

/** Store (or overwrite) the image for a slug. Latest upload wins. */
const saveImage = async (slug: string, data: Buffer, contentType: string): Promise<void> => {
  const paths = getImagePaths(slug)
  await fs.mkdir(paths.dir, { recursive: true })
  await fs.writeFile(paths.image, data)
  await fs.writeFile(paths.meta, JSON.stringify({ contentType }))
}

export default saveImage
