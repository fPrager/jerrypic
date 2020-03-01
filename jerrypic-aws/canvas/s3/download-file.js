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

    const response = await s3.getObject(params).promise();

    return response.Body;
};
