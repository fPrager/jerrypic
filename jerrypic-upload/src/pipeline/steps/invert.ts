import type { StepDefinition } from '../types.js'

const invert: StepDefinition = {
  type: 'invert',
  label: 'Invert',
  params: [],
  apply: (image) => {
    image.invert()
  },
}

export default invert
