import { Jimp, JimpMime } from 'jimp'
import { KINDLE_HEIGHT, /* KINDLE_JPEG_QUALITY ,*/ KINDLE_ROTATION, KINDLE_WIDTH } from './constants.js'

const convertToKindleJpeg = async (data: Buffer): Promise<Buffer> => {
  const image = await Jimp.read(data)
  image.resize({ w: KINDLE_WIDTH, h: KINDLE_HEIGHT })
  image.rotate(KINDLE_ROTATION)
  return image.getBuffer(JimpMime.jpeg, /*{ quality: KINDLE_JPEG_QUALITY }*/)
}

export default convertToKindleJpeg
