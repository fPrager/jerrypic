import { STEP_LIST } from './steps/index.js'

/**
 * The serializable step catalog (types, labels, param specs) injected into the
 * editor page so the frontend builds the UI from the same definitions the
 * backend validates and executes against.
 */
const getCatalog = () =>
  STEP_LIST.map(({ type, label, isTarget, params }) => ({
    type,
    label,
    isTarget: Boolean(isTarget),
    params,
  }))

export default getCatalog
