import { STEP_LIST } from './steps/index.js'
import type { ParamSpec } from './types.js'

/** A single serializable catalog entry handed to the editor UI. */
export type CatalogStep = {
  type: string
  label: string
  isTarget: boolean
  params: readonly ParamSpec[]
}

/**
 * The serializable step catalog (types, labels, param specs) injected into the
 * editor page so the frontend builds the UI from the same definitions the
 * backend validates and executes against.
 */
const getCatalog = (): CatalogStep[] =>
  STEP_LIST.map(({ type, label, isTarget, params }) => ({
    type,
    label,
    isTarget: Boolean(isTarget),
    params,
  }))

export default getCatalog
