import path from 'node:path'

const DATA_DIR = process.env.DATA_DIR || './data'

/** Resolve the on-disk paths used to store a slug's image and its metadata. */
const getImagePaths = (slug: string) => ({
  dir: DATA_DIR,
  image: path.join(DATA_DIR, `${slug}.img`),
  meta: path.join(DATA_DIR, `${slug}.meta.json`),
})

export default getImagePaths
