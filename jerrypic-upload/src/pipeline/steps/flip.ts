import type { StepDefinition } from '../types.js'

const flip: StepDefinition = {
  type: 'flip',
  label: 'Flip',
  params: [
    { name: 'horizontal', label: 'Horizontal', type: 'boolean', default: false },
    { name: 'vertical', label: 'Vertical', type: 'boolean', default: false },
  ],
  apply: (image, params) => {
    if (params.horizontal || params.vertical) {
      image.flip({ horizontal: Boolean(params.horizontal), vertical: Boolean(params.vertical) })
    }
  },
}

export default flip
