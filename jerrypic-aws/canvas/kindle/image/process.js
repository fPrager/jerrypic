const Jimp = require('jimp');
const { PNG } = require('pngjs');


module.exports = async ({
    url,
    resX = 1280,
    resY = 800,
    contrast = 0,
    brightness = 0,
}) => {
    if (typeof url !== 'string') { throw new Error('url must be a string'); }

    const image = await Jimp.read(url);
    image.resize(resX, resY);
    if (contrast !== 0) image.contrast(contrast);
    if (brightness !== 0) image.brightness(brightness);
    image.greyscale();

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const pngWith8bit = PNG.sync.read(buffer);
    const options = {
        colorType: 0,
        bitDepth: 8,
    };

    return PNG.sync.write(pngWith8bit, options);
};
