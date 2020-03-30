// aws doc: https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html
const path = require('path');

const getDataFromPutEvent = require('../s3/get-data-from-put-event');
const processImage = require('./image/process');
const getDestination = require('./location/get-destination');
const downloadFile = require('../s3/download-file');
const deleteFile = require('../s3/delete-file');
const uploadFile = require('../s3/upload-file');

module.exports = async (event) => {
    const { bucket, key } = getDataFromPutEvent(event);
    const { dstBucket, dstKey } = getDestination({ srcBucket: bucket, srcKey: key });

    if (bucket === dstBucket && key === dstKey) {
        return {
            statusCode: 200,
            body: 'Self Triggered Event',
        };
    }

    const extension = path.extname(key);
    if (extension !== '.jpg' && extension !== '.png') {
        return new Error(`Unsupported image type: ${extension}`);
    }

    const origData = await downloadFile({ bucket, key });
    await deleteFile({ bucket, key });

    const processedData = await processImage({
        data: origData,
    });

    await uploadFile({
        key: dstKey,
        bucket: dstBucket,
        buffer: processedData,
        acl: 'public-read',
    });

    const timestamp = `${Date.now()}`;
    await uploadFile({
        key: `${path.dirname(dstKey)}/timestamp`,
        bucket: dstBucket,
        buffer: Buffer.from(timestamp),
        acl: 'public-read',
    });

    return {
        statusCode: 200,
        body: `Successfully converted image for kual at ${timestamp}.`,
    };
};
