import type { StepDefinition } from '../types.js'

const contrast: StepDefinition = {
  type: 'contrast',
  label: 'Contrast',
  params: [{ name: 'amount', label: 'Amount', type: 'number', default: 0.2, min: -1, max: 1, step: 0.05, integer: false }],
  apply: (image, params) => {
    const amount = Number(params.amount) || 0
    if (amount !== 0) image.contrast(amount)
  },
}

export default contrast
