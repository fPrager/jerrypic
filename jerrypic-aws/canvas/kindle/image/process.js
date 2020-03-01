const Jimp = require('jimp');
const { PNG } = require('pngjs');


module.exports = async ({
    data,
    resX = 1024,
    resY = 758,
    contrast = 0,
    brightness = 0,
}) => {
    if (
        typeof data !== 'string'
        && !Buffer.isBuffer(data)
    ) { throw new Error('data must be a string or buffer'); }

    const image = await Jimp.read(data);
    image.resize(resX, resY);
    if (contrast !== 0) image.contrast(contrast);
    if (brightness !== 0) image.brightness(brightness);
    image.greyscale();
    image.rotate(-90);

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const pngWith8bit = PNG.sync.read(buffer);
    const options = {
        colorType: 0,
        bitDepth: 8,
    };

    return PNG.sync.write(pngWith8bit, options);
};
