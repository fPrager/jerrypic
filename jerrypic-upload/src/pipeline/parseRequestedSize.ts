export type RequestedSize = { width: number; height: number }

const parseDimension = (value: unknown): number => {
  const rounded = Math.round(Number(Array.isArray(value) ? value[0] : value))
  if (!Number.isFinite(rounded) || rounded < 1) return 0
  return Math.min(rounded, 10000)
}

const parseRequestedSize = (query: Record<string, unknown>): RequestedSize | null => {
  const width = parseDimension(query.w)
  const height = parseDimension(query.h)
  return width && height ? { width, height } : null
}

export default parseRequestedSize
