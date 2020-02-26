const Jimp = require('jimp');
const PNG = require('pngjs');
const ImageMock = require('../_mocks/jimp/image');

const { processImage } = require('./process-image');

jest.mock('jimp');
jest.mock('pngjs');

const validArgs = {
    url: 'url/to/the/image',
    resX: 200,
    resY: 200,
    contrast: 1,
    brightness: 1,
};


describe('processImage({ url, resX=1280, resY=800, contrast=0, brightness=0 })', () => {
    beforeEach(() => {
        Jimp.read = async () => ImageMock;
        PNG.sync = {
            read: jest.fn().mockReturnValue(Buffer.from('whatwhat')),
            write: jest.fn().mockReturnValue(Buffer.from('whatwhat')),
        };
    });

    it('is a function', () => {
        const actual = typeof processImage;
        const expected = 'function';

        expect(actual).toEqual(expected);
    });

    it('is async', () => {
        const actual = processImage.constructor.name;
        const expected = 'AsyncFunction';

        expect(actual).toEqual(expected);
    });

    it('throws if url is not a string', async () => {
        await expect(
            processImage({
                ...validArgs,
                url: 2,
            }),
        ).rejects.toThrow();
    });

    it('resolves with a buffer object', async () => {
        const result = await processImage(validArgs);

        expect(Buffer.isBuffer(result)).toBeTruthy();
    });

    it('reads image from \'url\' via jimp', async () => {
        const mockedRead = jest.fn(
            (url) => {
                expect(url).toEqual(validArgs.url);
                return Promise.resolve(ImageMock);
            },
        );
        Jimp.read = mockedRead;
        await processImage(validArgs);

        expect(mockedRead).toHaveBeenCalled();
    });

    it('resizes the image to \'resX\' or 1280 and \'resY\' or 800', async () => {
        const mockedResize = jest.fn((resX, resY) => {
            expect([validArgs.resX, 1280]).toContain(resX);
            expect([validArgs.resY, 800]).toContain(resY);
        });
        Jimp.read = async () => ({
            ...ImageMock,
            resize: mockedResize,
        });
        await processImage(validArgs);
        await processImage({
            ...validArgs,
            resX: undefined,
            resY: undefined,
        });

        expect(mockedResize).toHaveBeenCalledTimes(2);
    });

    it('changes the contrast if value is not 0 or undefined', async () => {
        const mockedContrast = jest.fn((contrast) => {
            expect(contrast).toEqual(validArgs.contrast);
        });
        Jimp.read = async () => ({
            ...ImageMock,
            contrast: mockedContrast,
        });
        await processImage(validArgs);
        await processImage({
            ...validArgs,
            contrast: undefined,
        });
        await processImage({
            ...validArgs,
            contrast: 0,
        });

        expect(mockedContrast).toHaveBeenCalledTimes(1);
    });

    it('changes the brightness if value is not 0 or undefined', async () => {
        const mockedBrightness = jest.fn((contrast) => {
            expect(contrast).toEqual(validArgs.contrast);
        });
        Jimp.read = async () => ({
            ...ImageMock,
            brightness: mockedBrightness,
        });
        await processImage(validArgs);
        await processImage({
            ...validArgs,
            brightness: undefined,
        });
        await processImage({
            ...validArgs,
            brightness: 0,
        });

        expect(mockedBrightness).toHaveBeenCalledTimes(1);
    });

    it('makes greyscale image', async () => {
        const mockedGreyscale = jest.fn();
        Jimp.read = async () => ({
            ...ImageMock,
            greyscale: mockedGreyscale,
        });
        await processImage(validArgs);

        expect(mockedGreyscale).toHaveBeenCalled();
    });

    it('converts image to 8bit depth', async () => {
        const mockedWrite = jest.fn((png, options) => {
            expect(options.colorType).toEqual(0);
            expect(options.bitDepth).toEqual(8);
            return '8bit-png';
        });
        PNG.sync = {
            read: jest.fn().mockReturnValue(Buffer.from('whatwhat')),
            write: mockedWrite,
        };
        await processImage(validArgs);

        expect(mockedWrite).toHaveBeenCalled();
    });
});
