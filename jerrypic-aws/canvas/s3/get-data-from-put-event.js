module.exports = (event) => (
    {
        bucket: event.Records[0].s3.bucket.name,
        key: decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' ')),
    }
);
