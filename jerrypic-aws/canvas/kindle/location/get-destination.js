const path = require('path');

module.exports = ({ srcBucket, srcKey }) => ({
    dstBucket: srcBucket,
    dstKey: `${path.dirname(srcKey)}/${(process.env.KUAL_IMAGE_NAME || 'jerrypic')}`,
});
