import type { StepDefinition } from '../types.js'

const fill: StepDefinition = {
  type: 'fill',
  label: 'Fill size',
  params: [
    { name: 'width', label: 'Width', type: 'number', default: 0, min: 1, max: 10000, optional: true },
    { name: 'height', label: 'Height', type: 'number', default: 0, min: 1, max: 10000, optional: true },
  ],
  apply: (image, params) => {
    const w = Number(params.width) || 0
    const h = Number(params.height) || 0
    if (w > 0 && h > 0) image.cover({ w, h })
  },
}

export default fill
