import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from './constants.js'

const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/

/**
 * A slug is the shared key between the upload and download endpoints.
 * Valid slugs are 10–64 chars of [A-Za-z0-9_-]. The restricted charset also
 * guarantees the slug is safe to use directly as a filename (no path traversal).
 */
const isValidSlug = (slug: unknown): slug is string =>
  typeof slug === 'string' &&
  slug.length >= SLUG_MIN_LENGTH &&
  slug.length <= SLUG_MAX_LENGTH &&
  SLUG_PATTERN.test(slug)

export default isValidSlug
