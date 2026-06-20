import type { StepDefinition } from '../types.js'

const greyscale: StepDefinition = {
  type: 'greyscale',
  label: 'Greyscale',
  params: [],
  apply: (image) => {
    image.greyscale()
  },
}

export default greyscale
