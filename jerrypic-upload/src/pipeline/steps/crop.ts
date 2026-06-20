import type { StepDefinition } from '../types.js'

const crop: StepDefinition = {
  type: 'crop',
  label: 'Crop',
  params: [
    { name: 'x', label: 'X', type: 'number', default: 0, min: 0, max: 10000 },
    { name: 'y', label: 'Y', type: 'number', default: 0, min: 0, max: 10000 },
    { name: 'width', label: 'Width', type: 'number', default: 0, min: 1, max: 10000, optional: true },
    { name: 'height', label: 'Height', type: 'number', default: 0, min: 1, max: 10000, optional: true },
  ],
  apply: (image, params) => {
    const { width: imgW, height: imgH } = image.bitmap
    const x = Math.min(Number(params.x) || 0, imgW - 1)
    const y = Math.min(Number(params.y) || 0, imgH - 1)
    const w = Number(params.width) || 0
    const h = Number(params.height) || 0
    if (w > 0 && h > 0) {
      image.crop({ x, y, w: Math.min(w, imgW - x), h: Math.min(h, imgH - y) })
    }
  },
}

export default crop
