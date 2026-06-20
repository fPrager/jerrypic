import { promises as fs } from 'node:fs'
import getImagePaths from './getImagePaths.js'
import type { ImageMeta } from './loadMeta.js'

/** Write a slug's meta sidecar (creating the data dir if needed). */
const writeMeta = async (slug: string, meta: ImageMeta): Promise<void> => {
  const paths = getImagePaths(slug)
  await fs.mkdir(paths.dir, { recursive: true })
  await fs.writeFile(paths.meta, JSON.stringify(meta))
}

export default writeMeta
