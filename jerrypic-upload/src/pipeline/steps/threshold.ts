import type { StepDefinition } from '../types.js'

const threshold: StepDefinition = {
  type: 'threshold',
  label: 'Threshold (B/W)',
  params: [{ name: 'max', label: 'Cutoff', type: 'number', default: 128, min: 0, max: 255 }],
  apply: (image, params) => {
    const max = Number(params.max)
    image.threshold({ max: Number.isFinite(max) ? max : 128 })
  },
}

export default threshold
