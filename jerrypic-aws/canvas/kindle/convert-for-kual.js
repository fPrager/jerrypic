// aws doc: https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html
const path = require('path');

const getDataFromPutEvent = require('../s3/get-data-from-put-event');
const processImage = require('./image/process');
const getDestination = require('./util/get-destination');
const downloadFile = require('../s3/download-file');
const uploadFile = require('../s3/upload-file');

module.exports = async (event, context, callback) => {
    const { bucket, key } = getDataFromPutEvent(event);
    const { dstBucket, dstKey } = getDestination({ srcBucket: bucket, srcKey: key });

    if (bucket === dstBucket && key === dstKey) {
        callback('Self Triggered Event');
        return;
    }

    const extension = path.extname(key);
    if (extension !== '.jpg' && extension !== '.png') {
        callback(`Unsupported image type: ${extension}`);
        return;
    }

    const origData = await downloadFile({ bucket, key });
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

    callback(null, {
        statusCode: 200,
        body: `Successfully converted image for kual at ${timestamp}.`,
    });
};
