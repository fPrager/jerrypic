const AWS = require('aws-sdk');

const s3 = new AWS.S3();

module.exports = async ({
    key,
    bucket,
}) => {
    const params = {
        Bucket: bucket,
        Key: key,
    };

    await s3.deleteObject(params).promise();
};
