import { promises as fs } from 'node:fs'
import getImagePaths from './getImagePaths.js'

/** Whether an image has already been uploaded for a slug. */
const imageExists = async (slug: string): Promise<boolean> => {
  try {
    await fs.access(getImagePaths(slug).image)
    return true
  } catch {
    return false
  }
}

export default imageExists
