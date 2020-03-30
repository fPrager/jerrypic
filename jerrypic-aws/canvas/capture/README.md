# Lambda with headless chromium

The *captureFromWebpage* serverless function needs a headless_chromium to run puppeteer. The easiest way to is using the [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda).

To keep the function deployment lightweight it's recommended to setup a layer for your lambda environment (explained in the package readme). So instead of uploading 100mb you just upload 8mb every deploy.

## Unsuccessful alternative

Install puppeteer (without chromeium set the environment ``PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ``) and place place your compiled chromium next to that script and reference the shell with
the exectuablePAth argument on puppeteer initialization.

You can find a useful discussion about the headless chromium build with webgl support (via swiftshader) here:

https://github.com/adieuadieu/serverless-chrome/issues/108

And a repo with the required files here:

https://github.com/apalchys/lambda-puppeteer-webgl-swiftshader

# Required code setting

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

# Issue with that

The new lambda environment of AWS couldn get puppeteer started. There was always an ENOENT error or input.on bla bla error. Check all files references, altrnative node versions and puppeteer versions. No success. So went over to the full prepared package ``chrome-aws-lambda``. worked great.