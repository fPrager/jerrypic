const getDataFromPutEvent = require('./get-data-from-put-event');
const mockedPutEvent = require('../_mocks/s3/generalPutEvent.json');

describe('getDataFromPutEvent(event)', () => {
    it('is a function', () => {
        const actual = typeof getDataFromPutEvent;
        const expected = 'function';
        expect(actual).toEqual(expected);
    });

    it('returns object with \'bucket\' field', () => {
        const actual = getDataFromPutEvent(mockedPutEvent).bucket;
        const expected = 'lambda-artifacts-deafc19498e3f2df';

        expect(actual).toEqual(expected);
    });

    it('returns object with \'key\' field (no spaces, uri decoded)', () => {
        const actual = getDataFromPutEvent(mockedPutEvent).key;
        const expected = 'this is some:file';

        expect(actual).toEqual(expected);
    });
});
