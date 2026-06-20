import type { StepDefinition } from '../types.js'

const brightness: StepDefinition = {
  type: 'brightness',
  label: 'Brightness',
  params: [{ name: 'amount', label: 'Amount', type: 'number', default: 0.1, min: -1, max: 1, step: 0.05, integer: false }],
  apply: (image, params) => {
    const amount = Number(params.amount) || 0
    if (amount !== 0) image.brightness(amount)
  },
}

export default brightness
