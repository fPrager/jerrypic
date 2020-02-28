// aws doc: https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html
const path = require('path');

const getDataFromPutEvent = require('../s3/get-data-from-put-event');
const processImage = require('./image/process');
const getDestination = require('./util/get-destination');
const uploadFile = require('../s3/upload-file');

exports.convertForKual = async (event, context, callback) => {
    const { bucket, key } = getDataFromPutEvent(event);
    const { dstBucket, dstKey } = getDestination({ srcBucket: bucket, srcKey: key });

    if (bucket === dstBucket && key === dstKey) {
        callback('Self Triggered Event');
        return;
    }

    const extension = path.extname(key);
    if (extension !== 'jpg' && extension !== 'png') {
        callback(`Unsupported image type: ${extension}`);
        return;
    }

    const buffer = await processImage({
        url: `https://${bucket}.s3.amazonaws.com/${key}`,
    });

    await uploadFile({
        key: dstKey,
        bucket: dstBucket,
        buffer,
        acl: 'public-read',
    });

    await uploadFile({
        key: `${path.dirname(dstKey)}/timestamp`,
        bucket: dstBucket,
        buffer: Buffer.from(Date.now().geTime()),
        acl: 'public-read',
    });
};
