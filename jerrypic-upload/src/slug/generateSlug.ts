import { adjectives, uniqueNamesGenerator } from 'unique-names-generator'
import isValidSlug from './isValidSlug.js'

const CONSONANTS = 'bcdfghjklmnpqrstvwxz'
const VOWELS = 'aeiou'

const randomFrom = (chars: string): string => chars[Math.floor(Math.random() * chars.length)]

// A pronounceable made-up word built from consonant+vowel syllables, e.g. "zolimu", "vexabo".
const fictiveWord = (syllables = 3): string =>
  Array.from({ length: syllables }, () => randomFrom(CONSONANTS) + randomFrom(VOWELS)).join('')

/** Generate a readable slug: an adjective plus a made-up word, e.g. "wandering-zolimu". */
const generateSlug = (): string => {
  let slug = ''
  do {
    const adjective = uniqueNamesGenerator({ dictionaries: [adjectives], length: 1 })
    slug = `${adjective}-${fictiveWord()}`
  } while (!isValidSlug(slug))
  return slug
}

export default generateSlug
