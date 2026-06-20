import type { StepDefinition } from '../types.js'

const autocrop: StepDefinition = {
  type: 'autocrop',
  label: 'Auto-crop borders',
  params: [],
  apply: (image) => {
    image.autocrop()
  },
}

export default autocrop
