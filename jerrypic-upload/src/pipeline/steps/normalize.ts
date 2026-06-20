import type { StepDefinition } from '../types.js'

const normalize: StepDefinition = {
  type: 'normalize',
  label: 'Normalize contrast',
  params: [],
  apply: (image) => {
    image.normalize()
  },
}

export default normalize
