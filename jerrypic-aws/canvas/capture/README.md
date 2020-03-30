# Lambda with headless chromium

The *captureFromWebpage* serverless function needs a headless_chromium to run puppeteer.

## Required chromium files

The puppeteer package should not contain the chromium files. So keep in mind to set the environment ``PUPPETEER_SKIP_CHROMIUM_DOWNLOAD `` before running ``npm i`` (so chromium download will be skiped).

You can find a useful discussion about the headless chromium build with webgl support (via swiftshader) here:

https://github.com/adieuadieu/serverless-chrome/issues/108

And a repo with the required files here:

https://github.com/apalchys/lambda-puppeteer-webgl-swiftshader

## Required code setting

Not the required gl-option in the puppeteer browser:

``
const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    args: [
      '--disable-dev-shm-usage',
      '--no-zygote',
      '--use-gl=swiftshader', // <--- !!!
      '--enable-webgl', // <--- !!!
      '--hide-scrollbars',
      '--mute-audio',
      '--no-sandbox',
      '--single-process',
      '--disable-breakpad',
      '--ignore-gpu-blacklist',
      '--headless'
    ],
    executablePath: './headless_chromium/headless_shell'
  });
``