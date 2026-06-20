import { createHash } from 'node:crypto'

/** SHA-256 (hex) of image bytes (or any string) — the single source of truth for the algorithm. */
const hashImageData = (data: Buffer | string): string => createHash('sha256').update(data).digest('hex')

export default hashImageData
