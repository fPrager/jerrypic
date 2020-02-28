const getDestination = require('./get-destination');

const validArgs = {
    srcBucket: 'my-bucket',
    srcKey: 'awesome/file/in/bucket.png',
};

describe('getDestination({ srcBucket, srcKey })', () => {
    it('is a function', () => {
        const actual = typeof getDestination;
        const expected = 'function';
        expect(actual).toEqual(expected);
    });

    it('returns \'dstBucket\' field same as \'srcBucket\'', () => {
        const actual = getDestination(validArgs).dstBucket;
        const expected = 'my-bucket';

        expect(actual).toEqual(expected);
    });

    it('returns \'dstKey\' field as same location but env \'KUAL_IMAGE_NAME\' as file name', () => {
        const origEnv = process.env.KUAL_IMAGE_NAME;
        process.env.KUAL_IMAGE_NAME = 'blaaablaaablaaa.png';

        const actual = getDestination(validArgs).dstKey;
        const expected = 'awesome/file/in/blaaablaaablaaa.png';

        expect(actual).toEqual(expected);

        process.env.KUAL_IMAGE_NAME = origEnv;
    });

    it(`returns 'dstKey' field as same location but 'image.png' as file name 
        if env 'KUAL_IMAGE_NAME' is missing`, () => {
        const origEnv = process.env.KUAL_IMAGE_NAME;
        delete process.env.KUAL_IMAGE_NAME;

        const actual = getDestination(validArgs).dstKey;
        const expected = 'awesome/file/in/image.png';

        expect(actual).toEqual(expected);

        process.env.KUAL_IMAGE_NAME = origEnv;
    });
});
