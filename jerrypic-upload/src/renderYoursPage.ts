import type { CatalogStep, Step } from './pipeline/index.js'

type RenderYoursPageInput = {
  slug: string
  hasImage: boolean
  rawUrl: string
  outputUrl: string
  pipeline: Step[]
  catalog: CatalogStep[]
  rawWidth?: number
  rawHeight?: number
}

// A single route row: a method badge, the URL, and a short explanation.
const routeRow = ({ method, url, hint }: { method: string; url: string; hint: string }): string => `
        <div class="route-group">
          <div class="route">
            <span class="route__method route__method--${method.toLowerCase()}">${method}</span>
            <a class="route__url" href="${url}">${url}</a>
          </div>
          <p class="route__hint">${hint}</p>
        </div>`

// Left side: the raw source image you control — drop a photo, see it, and the
// POST route that replaces it.
const sourcePanel = ({ hasImage, rawUrl }: { hasImage: boolean; rawUrl: string }): string => `
      <section class="panel">
        <h2 class="panel__title">Yours</h2>

        ${
          hasImage
            ? `<figure class="preview"><img src="${rawUrl}" alt="Your uploaded picture" /></figure>`
            : `<div class="placeholder">No picture yet</div>`
        }

        <div class="dropzone" id="dropzone">
          <p class="dropzone__title">Drop a photo here, or click to choose</p>
          <p class="dropzone__hint">JPG or PNG</p>
          <input type="file" id="file" accept="image/png,image/jpeg" hidden />
        </div>
        <p class="status" id="status"></p>

        <div class="routes">
          ${routeRow({ method: 'POST', url: rawUrl, hint: 'Send raw image bytes here to set or replace the source picture.' })}
        </div>
      </section>`

// Right side: the pipeline output — the processed preview plus the GET routes the
// Kindle uses to download and to poll for changes.
const outputPanel = ({ hasImage, outputUrl }: { hasImage: boolean; outputUrl: string }): string => `
      <section class="panel">
        <h2 class="panel__title">Mine</h2>

        ${
          hasImage
            ? `<figure class="preview"><img id="output-img" src="${outputUrl}" alt="Processed output" /></figure>`
            : `<div class="placeholder">Upload to preview</div>`
        }

        <div class="routes">
          ${routeRow({ method: 'GET', url: outputUrl, hint: 'The processed image — what the Kindle downloads.' })}
          ${routeRow({ method: 'GET', url: `${outputUrl}/hash`, hint: 'SHA-256 of the output (image + pipeline). Poll it to detect changes cheaply.' })}
        </div>
      </section>`

// The pipeline editor between the panels. Two hand-drawn, elbowed arrows: one
// comes in from the left and bends down into the pipe, the other drops down and
// bends right out to the output. Wobbly paths give them a scribbled, marker feel.
const arrowInLeftDown = `<svg class="flow__svg flow__svg--down" viewBox="0 0 64 54" fill="none" stroke="#c0562b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9 C 13 5 20 13 28 9 C 35 6 33 17 35 23 C 37 30 35 37 37 43 C 37.6 46 37 48 37.5 50" /><path d="M29 41 C 32 45 35 47 37.5 51 C 40 47 43 45 46 41" /></svg>`
const arrowOutDownRight = `<svg class="flow__svg flow__svg--right" viewBox="0 0 64 54" fill="none" stroke="#c0562b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4 C 11 13 18 19 15 26 C 12 33 23 31 30 33 C 37 35 45 32 52 34 C 55 34.7 57 34 59 34.5" /><path d="M50 26 C 54 29 56 31 60 34 C 56 37 54 39 51 42" /></svg>`

const pipeEditor = (): string => `
      <div class="flow">
        <div class="flow__arrow flow__arrow--in" aria-hidden="true">${arrowInLeftDown}</div>
        <div class="pipe" id="pipe"></div>
        <p class="pipe__status" id="pipe-status" aria-live="polite"></p>
        <div class="pipe__add">
          <select class="pipe__select" id="add-step" aria-label="Add a step"></select>
          <button class="pipe__addbtn" id="add-step-btn" type="button">+ add</button>
        </div>
        <div class="flow__arrow flow__arrow--out" aria-hidden="true">${arrowOutDownRight}</div>
      </div>`

// Serialize the editor state for the client. Escape "<" so the JSON can't break out of the script tag.
const serializeState = (state: unknown): string => JSON.stringify(state).replace(/</g, '\\u003c')

/** Render the /yours/@:slug page: source panel, pipeline editor, and output panel. */
const renderYoursPage = ({
  slug,
  hasImage,
  rawUrl,
  outputUrl,
  pipeline,
  catalog,
  rawWidth,
  rawHeight,
}: RenderYoursPageInput): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Jerry pic</title>
    <style>
      @font-face {
        font-family: 'Marker';
        src: url('/fonts/PermanentMarker-Regular.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'Brush';
        src: url('/fonts/CaveatBrush-Regular.ttf') format('truetype');
        font-display: swap;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        background: #f4efe6;
        color: #2b2b2b;
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      }

      main {
        width: 100%;
        max-width: 1180px;
        text-align: center;
      }

      .headline {
        margin: 0 0 1.75rem;
        line-height: 0.95;
        font-weight: 400;
      }
      .headline .line { display: block; }
      .headline .caps {
        font-family: 'Marker', sans-serif;
        font-size: clamp(2.4rem, 9vw, 4.2rem);
        vertical-align: baseline;
      }
      .headline .script {
        font-family: 'Brush', cursive;
        font-size: clamp(3rem, 11vw, 5.4rem);
        color: #c0562b;
        vertical-align: baseline;
      }

      /* Two panels with the arrow between them. */
      .stage {
        display: flex;
        align-items: stretch;
        justify-content: center;
        gap: 1.25rem;
        text-align: left;
      }

      .panel {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: #fbf8f1;
        border: 1px solid #e7ddc8;
        border-radius: 18px;
        padding: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      }
      .panel__title {
        margin: 0;
        text-align: center;
        font-family: 'Brush', cursive;
        font-weight: 400;
        font-size: 2.1rem;
        color: #c0562b;
      }

      .dropzone {
        border: 3px dashed #b9ac95;
        border-radius: 16px;
        padding: 1.75rem 1.25rem;
        background: #fdfbf6;
        cursor: pointer;
        text-align: center;
        transition: border-color 0.15s, background 0.15s;
      }
      .dropzone:hover,
      .dropzone.over {
        border-color: #c0562b;
        background: #fdf2ea;
      }
      .dropzone__title {
        margin: 0 0 0.2rem;
        font-family: 'Brush', cursive;
        font-size: 1.5rem;
        font-weight: 400;
      }
      .dropzone__hint {
        margin: 0;
        font-family: 'Marker', sans-serif;
        font-size: 0.95rem;
        letter-spacing: 0.02em;
        color: #8a8170;
      }

      .status {
        min-height: 1.2rem;
        margin: 0;
        text-align: center;
        font-size: 0.9rem;
        color: #6b6457;
      }
      .status.error { color: #c0392b; }

      .preview { margin: 0; }
      .preview img {
        display: block;
        max-width: 100%;
        max-height: 260px;
        margin: 0 auto;
        border-radius: 10px;
      }

      .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 160px;
        padding: 1rem;
        border: 2px dashed #d8cdb5;
        border-radius: 10px;
        color: #8a8170;
        font-family: 'Brush', cursive;
        font-size: 1.3rem;
      }

      /* Routes pinned to the bottom so both panels line up. */
      .routes {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
      .route {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.6rem;
        background: #f4efe6;
        border-radius: 8px;
      }
      .route__method {
        flex: none;
        font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        padding: 0.15rem 0.4rem;
        border-radius: 5px;
        background: #e6ddc9;
        color: #6b6457;
      }
      .route__method--post { background: #c0562b; color: #fff; }
      .route__url {
        min-width: 0;
        word-break: break-all;
        font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
        font-size: 0.78rem;
        color: #c0562b;
        text-decoration: none;
      }
      .route__url:hover { text-decoration: underline; }
      .route__hint {
        margin: 0.3rem 0 0;
        font-size: 0.72rem;
        color: #8a8170;
      }

      /* The pipeline editor column between the panels. */
      .flow {
        flex: 0 0 320px;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .flow__arrow { display: flex; }
      .flow__arrow--in { justify-content: flex-start; padding-left: 0.5rem; }
      .flow__arrow--out { justify-content: flex-end; padding-right: 0.5rem; }
      .flow__svg { width: 60px; height: auto; display: block; }

      .pipe { display: flex; flex-direction: column; gap: 0.5rem; }
      .step {
        background: #fbf8f1;
        border: 1px solid #e7ddc8;
        border-radius: 12px;
        padding: 0.55rem 0.65rem;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
      }
      .step--target { border-color: #e0b9a6; background: #fdf4ee; }
      .step__head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
      .step__name { font-family: 'Brush', cursive; font-size: 1.2rem; }
      .step__ctrls { display: flex; gap: 0.2rem; }
      .step__ctrls button {
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        border: 1px solid #d8cdb5;
        border-radius: 6px;
        background: #fff;
        color: #6b6457;
        font-size: 0.8rem;
        line-height: 1;
        cursor: pointer;
      }
      .step__ctrls button:hover:not(:disabled) { border-color: #c0562b; color: #c0562b; }
      .step__ctrls button:disabled { opacity: 0.35; cursor: default; }
      .step__params { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
      .param { display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.68rem; color: #8a8170; }
      .param--check { flex-direction: row; align-items: center; gap: 0.3rem; font-size: 0.78rem; color: #2b2b2b; }
      .param input[type='number'],
      .param select {
        width: 5.5rem;
        padding: 0.2rem 0.3rem;
        border: 1px solid #d8cdb5;
        border-radius: 6px;
        background: #fff;
        font-size: 0.8rem;
      }

      .pipe__add { display: flex; gap: 0.4rem; }
      .pipe__select {
        flex: 1;
        min-width: 0;
        padding: 0.3rem;
        border: 1px solid #d8cdb5;
        border-radius: 8px;
        background: #fff;
        font-size: 0.82rem;
      }
      .pipe__addbtn {
        flex: none;
        border: none;
        border-radius: 8px;
        padding: 0.3rem 0.7rem;
        background: #c0562b;
        color: #fff;
        font-family: 'Marker', sans-serif;
        font-size: 0.85rem;
        cursor: pointer;
      }
      .pipe__addbtn:hover { background: #a8491f; }
      .pipe__status { margin: 0; min-height: 1rem; text-align: center; font-size: 0.72rem; color: #8a8170; }

      /* Stack vertically on narrow screens; center the arrows and point the output down. */
      @media (max-width: 820px) {
        .stage { flex-direction: column; align-items: stretch; }
        .flow { flex-basis: auto; }
        .flow__arrow--in,
        .flow__arrow--out { justify-content: center; padding: 0; }
        .flow__svg--right { transform: rotate(90deg); }
      }
    </style>
  </head>
  <body data-slug="${slug}">
    <main>
      <h1 class="headline">
        <span class="line"><span class="caps">Jerry</span> <span class="script">pic</span></span>
      </h1>

      <div class="stage">
        ${sourcePanel({ hasImage, rawUrl })}
        ${pipeEditor()}
        ${outputPanel({ hasImage, outputUrl })}
      </div>
    </main>
    <script id="pipeline-state" type="application/json">${serializeState({
      slug,
      outputUrl,
      pipeline,
      catalog,
      rawSize: { width: rawWidth ?? null, height: rawHeight ?? null },
    })}</script>
    <script src="/app.js"></script>
  </body>
</html>`

export default renderYoursPage
