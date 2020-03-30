
const chromium = require('chrome-aws-lambda');

const uploadFile = require('../s3/upload-file');
const isRequired = require('../is-required');

module.exports = async (event) => {
    const { body } = event;

    if (!body) {
        return new Error('Missing Request Body');
    }

    console.log('fetch payload');

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

    console.log('setup browser');

    const browser = await chromium.puppeteer.launch({
        ignoreHTTPSErrors: true,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless,
        executablePath: await chromium.executablePath,
        /*
        args: [
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--use-gl=swiftshader',
            '--enable-webgl',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-sandbox',
            '--single-process',
            '--disable-breakpad',
            '--ignore-gpu-blacklist',
            '--headless',
        ],
        */
    });

    console.log('visit page at', url);

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url);

    if (waitFor !== null) { await page.waitFor(waitFor); }
    if (waitForSelector !== null) { await page.waitForSelector(waitForSelector); }

    const screenshotBuffer = await page.screenshot({
        encoding: 'binary',
    });

    console.log('upload file to', dstBucket, dstKey);
    console.log(screenshotBuffer.byteLength);

    await uploadFile({
        key: dstKey,
        bucket: dstBucket,
        buffer: screenshotBuffer,
        acl: 'public-read',
    });

    console.log('upload done');

    return {
        statusCode: 200,
        body: `Successfully captured screenshot from ${url}.`,
    };
};
