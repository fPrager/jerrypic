type RenderYoursPageInput = {
  slug: string
  hasImage: boolean
  downloadUrl: string
  uploadUrl: string
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

// Left side: the source image you control — drop a photo, see it, and the POST
// route that replaces it.
const sourcePanel = ({ slug, hasImage, uploadUrl }: { slug: string; hasImage: boolean; uploadUrl: string }): string => `
      <section class="panel">
        <h2 class="panel__title">Yours</h2>

        ${
          hasImage
            ? `<figure class="preview"><img src="/mine/@${slug}" alt="Your uploaded picture" /></figure>`
            : `<div class="placeholder">No picture yet</div>`
        }

        <div class="dropzone" id="dropzone">
          <p class="dropzone__title">Drop a photo here, or click to choose</p>
          <p class="dropzone__hint">JPG or PNG</p>
          <input type="file" id="file" accept="image/png,image/jpeg" hidden />
        </div>
        <p class="status" id="status"></p>

        <div class="routes">
          ${routeRow({ method: 'POST', url: uploadUrl, hint: 'Send raw image bytes here to set or replace the picture.' })}
        </div>
      </section>`

// Right side: what the Kindle gets — the converted preview plus the GET routes
// the device uses to download and to poll for changes.
const kindlePanel = ({ slug, hasImage, downloadUrl }: { slug: string; hasImage: boolean; downloadUrl: string }): string => `
      <section class="panel">
        <h2 class="panel__title">Mine</h2>

        ${
          hasImage
            ? `<figure class="preview preview--kindle"><img src="/mine/@${slug}/kindle" alt="Kindle version" /></figure>`
            : `<div class="placeholder">Upload to preview</div>`
        }

        <div class="routes">
          ${routeRow({ method: 'GET', url: `${downloadUrl}/kindle`, hint: 'Grayscale JPEG at the device resolution — what the Kindle downloads.' })}
          ${routeRow({ method: 'GET', url: `${downloadUrl}/hash`, hint: 'SHA-256 of the current image. Poll it to detect changes cheaply.' })}
        </div>
      </section>`

// The hand-drawn arrow between the two panels (turns to point down on narrow screens).
const flowArrow = (): string => `
      <div class="flow" aria-hidden="true">
        <span class="flow__label">converts to</span>
        <div class="flow__arrow">
          <svg viewBox="0 0 96 40" fill="none" stroke="#c0562b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 21 C 30 14, 54 28, 80 20" />
            <path d="M66 11 L82 20 L66 29" />
          </svg>
        </div>
      </div>`

/** Render the /yours/@:slug upload page: a source panel, an arrow, and the Kindle panel. */
const renderYoursPage = ({ slug, hasImage, downloadUrl, uploadUrl }: RenderYoursPageInput): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Upload your Jerry pic</title>
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
        max-width: 1000px;
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
      /* Show the Kindle preview the way the e-ink screen renders it. */
      .preview--kindle img {
        filter: grayscale(1) contrast(1.05);
        background: #fff;
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

      /* The arrow between the panels. */
      .flow {
        flex: none;
        align-self: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.4rem;
      }
      .flow__label {
        font-family: 'Brush', cursive;
        font-size: 1.2rem;
        color: #8a8170;
      }
      .flow__arrow {
        width: 96px;
        animation: nudge 1.8s ease-in-out infinite;
      }
      .flow__arrow svg { width: 100%; height: auto; display: block; }
      @keyframes nudge {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(6px); }
      }
      @media (prefers-reduced-motion: reduce) {
        .flow__arrow { animation: none; }
      }

      /* Stack vertically on narrow screens; arrow points down. */
      @media (max-width: 820px) {
        .stage { flex-direction: column; align-items: stretch; }
        .flow__arrow { animation: none; }
        .flow__arrow svg { transform: rotate(90deg); }
      }
    </style>
  </head>
  <body data-slug="${slug}">
    <main>
      <h1 class="headline">
        <span class="line"><span class="caps">Upload</span> <span class="script">your</span></span>
        <span class="line"><span class="caps">Jerry</span> <span class="script">pic</span></span>
      </h1>

      <div class="stage">
        ${sourcePanel({ slug, hasImage, uploadUrl })}
        ${flowArrow()}
        ${kindlePanel({ slug, hasImage, downloadUrl })}
      </div>
    </main>
    <script src="/app.js"></script>
  </body>
</html>`

export default renderYoursPage
