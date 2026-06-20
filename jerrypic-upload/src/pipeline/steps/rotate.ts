import type { StepDefinition } from '../types.js'

const rotate: StepDefinition = {
  type: 'rotate',
  label: 'Rotate',
  params: [{ name: 'deg', label: 'Degrees', type: 'number', default: -90, min: -360, max: 360, step: 90 }],
  apply: (image, params) => {
    const deg = Number(params.deg) || 0
    if (deg % 360 !== 0) image.rotate(deg)
  },
}

export default rotate
