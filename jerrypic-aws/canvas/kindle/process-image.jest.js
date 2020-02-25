// const Jimp = require('jimp');
const { processImage } = require('./process-image');

describe('processImage({ url, resX=1280, resY=800, contrast=0, brightness=0 })', () => {
    it('is a function', () => {
        const actual = typeof processImage;
        const expected = 'function';

        expect(actual).toEqual(expected);
    });
});
