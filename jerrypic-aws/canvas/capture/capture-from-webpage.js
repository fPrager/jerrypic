
const chromium = require('chrome-aws-lambda');

const uploadFile = require('../s3/upload-file');
const isRequired = require('../is-required');

module.exports = async (event) => {
    const { body } = event;

    if (!body) {
        return new Error('Missing Request Body');
    }

    const {
        url = isRequired('url', true),
        dstBucket = isRequired('dstBucket', true),
        dstKey = isRequired('dstKey', true),
        waitFor = null,
        waitForSelector = null,
        width = 800,
        height = 600,
    } = body;

    if (!url || !dstBucket || !dstKey) {
        return new Error('Missing Required Request Parameter');
    }

    const browser = await chromium.puppeteer.launch({
        ignoreHTTPSErrors: true,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless,
        executablePath: await chromium.executablePath,
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url);

    if (waitFor !== null) { await page.waitFor(waitFor); }
    if (waitForSelector !== null) { await page.waitForSelector(waitForSelector); }

    const screenshotBuffer = await page.screenshot({
        encoding: 'binary',
    });

    await uploadFile({
        key: dstKey,
        bucket: dstBucket,
        buffer: screenshotBuffer,
        acl: 'public-read',
    });

    return {
        statusCode: 200,
        body: `Successfully captured screenshot from ${url}.`,
    };
};
