import type { StepDefinition } from '../types.js'

const dither: StepDefinition = {
  type: 'dither',
  label: 'Dither',
  params: [],
  apply: (image) => {
    image.dither()
  },
}

export default dither
