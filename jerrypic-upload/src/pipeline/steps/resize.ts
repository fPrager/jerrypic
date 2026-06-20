import type { StepDefinition } from '../types.js'

// Width/height default to 0 ("source size") so a freshly added step is a no-op
// until the editor pre-fills it with the raw image's dimensions.
const resize: StepDefinition = {
  type: 'resize',
  label: 'Resize',
  params: [
    { name: 'width', label: 'Width', type: 'number', default: 0, min: 1, max: 10000, optional: true },
    { name: 'height', label: 'Height', type: 'number', default: 0, min: 1, max: 10000, optional: true },
  ],
  apply: (image, params) => {
    const width = Number(params.width) || 0
    const height = Number(params.height) || 0
    if (width && height) image.resize({ w: width, h: height })
    else if (width) image.resize({ w: width })
    else if (height) image.resize({ h: height })
  },
}

export default resize
