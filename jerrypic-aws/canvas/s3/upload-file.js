const AWS = require('aws-sdk');

const s3 = new AWS.S3();

module.exports = async ({
    key,
    bucket,
    buffer,
    acl,
}) => {
    const params = {
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ACL: acl,
    };

    await s3.upload(params).promise();
};
