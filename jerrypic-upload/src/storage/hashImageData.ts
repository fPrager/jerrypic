import { createHash } from 'node:crypto'

/** SHA-256 (hex) of image bytes — the single source of truth for the algorithm. */
const hashImageData = (data: Buffer): string => createHash('sha256').update(data).digest('hex')

export default hashImageData
