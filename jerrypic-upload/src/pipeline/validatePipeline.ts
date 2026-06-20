import registry from './steps/index.js'
import type { ParamSpec, Step, StepDefinition } from './types.js'

const MAX_STEPS = 50

const coerceParam = (spec: ParamSpec, value: unknown): unknown => {
  if (spec.type === 'boolean') return Boolean(value)
  if (spec.type === 'select') {
    return spec.options.some((option) => option.value === value) ? value : spec.default
  }
  // number
  let n = Number(value)
  if (!Number.isFinite(n)) n = spec.default
  if (spec.optional && n <= 0) return 0
  n = Math.min(spec.max, Math.max(spec.min, n))
  return spec.integer === false ? n : Math.round(n)
}

const normalizeStep = (def: StepDefinition, rawParams: unknown): Step => {
  const source = (rawParams && typeof rawParams === 'object' ? rawParams : {}) as Record<string, unknown>
  const params: Record<string, unknown> = {}
  for (const spec of def.params) params[spec.name] = coerceParam(spec, source[spec.name])
  return { type: def.type, params }
}

const defaultTargetStep = (): Step => {
  const target = Object.values(registry).find((def) => def.isTarget) as StepDefinition
  return normalizeStep(target, {})
}

/**
 * Normalize an untrusted pipeline against the step registry: drop unknown step
 * types, coerce/clamp every parameter, cap the length, and guarantee exactly one
 * target step at the end (appended with defaults if the input had none).
 */
const validatePipeline = (raw: unknown): Step[] => {
  const input = Array.isArray(raw) ? raw : []
  const normalized: Step[] = []
  let target: Step | null = null

  for (const item of input) {
    const def = registry[(item as Step)?.type]
    if (!def) continue
    const step = normalizeStep(def, (item as Step)?.params)
    if (def.isTarget) target = step
    else if (normalized.length < MAX_STEPS) normalized.push(step)
  }

  normalized.push(target ?? defaultTargetStep())
  return normalized
}

export default validatePipeline
