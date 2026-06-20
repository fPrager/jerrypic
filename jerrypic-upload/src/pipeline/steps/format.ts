import { JimpMime } from 'jimp'
import type { StepDefinition } from '../types.js'

// The always-last step: encodes the final image to the chosen container format.
const format: StepDefinition = {
  type: 'format',
  label: 'Output format',
  isTarget: true,
  params: [
    {
      name: 'format',
      label: 'Format',
      type: 'select',
      default: 'jpeg',
      options: [
        { value: 'jpeg', label: 'JPEG' },
        { value: 'png', label: 'PNG' },
        { value: 'bmp', label: 'BMP' },
        { value: 'tiff', label: 'TIFF' },
        { value: 'gif', label: 'GIF' },
      ],
    },
    { name: 'quality', label: 'Quality (JPEG)', type: 'number', default: 80, min: 1, max: 100 },
  ],
  encode: async (image, params) => {
    const quality = Number(params.quality) || 80
    switch (params.format) {
      case 'png':
        return { buffer: await image.getBuffer(JimpMime.png), contentType: JimpMime.png }
      case 'bmp':
        return { buffer: await image.getBuffer(JimpMime.bmp), contentType: JimpMime.bmp }
      case 'tiff':
        return { buffer: await image.getBuffer(JimpMime.tiff), contentType: JimpMime.tiff }
      case 'gif':
        return { buffer: await image.getBuffer(JimpMime.gif), contentType: JimpMime.gif }
      case 'jpeg':
      default:
        return { buffer: await image.getBuffer(JimpMime.jpeg, { quality }), contentType: JimpMime.jpeg }
    }
  },
}

export default format
