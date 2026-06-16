type RenderYoursPageInput = {
  slug: string
  hasImage: boolean
  downloadUrl: string
}

// The image section is only rendered server-side when an image already exists.
// After a (re)upload the client simply reloads, so this stays the single source of truth.
const imageSection = ({ slug, downloadUrl }: { slug: string; downloadUrl: string }): string => `
      <figure class="preview">
        <img src="/mine/@${slug}" alt="Your uploaded Jerry pic" />
      </figure>
      <section class="download">
        <p class="download__label">Image download URL</p>
        <a class="download__url" href="${downloadUrl}">${downloadUrl}</a>
      </section>`


const imageSectionKindle = ({ slug, downloadUrl }: { slug: string; downloadUrl: string }): string => `
      <figure class="preview">
        <img src="/mine/@${slug}/kindle" alt="Your uploaded Jerry pic" />
      </figure>
      <section class="download">
        <p class="download__label">Kindle download URL</p>
        <a class="download__url" href="${downloadUrl}">${downloadUrl}/kindle</a>
      </section>`

/** Render the /yours/@:slug upload page (headline, dropzone, and any existing image). */
const renderYoursPage = ({ slug, hasImage, downloadUrl }: RenderYoursPageInput): string => `<!doctype html>
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
        max-width: 560px;
        text-align: center;
      }

      .headline {
        margin: 0 0 2rem;
        line-height: 0.9;
        font-weight: 400;
      }
      .headline .caps {
        font-family: 'Marker', sans-serif;
        font-size: clamp(2.8rem, 11vw, 5rem);
        display: block;
      }
      .headline .script {
        font-family: 'Brush', cursive;
        font-size: clamp(3.6rem, 14vw, 6.5rem);
        display: block;
        color: #c0562b;
        margin-top: -0.05em;
      }

      .dropzone {
        border: 3px dashed #b9ac95;
        border-radius: 16px;
        padding: 2.5rem 1.5rem;
        background: #fbf8f1;
        cursor: pointer;
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
        font-size: 1.8rem;
        font-weight: 400;
      }
      .dropzone__hint {
        margin: 0;
        font-family: 'Marker', sans-serif;
        font-size: 1rem;
        letter-spacing: 0.02em;
        color: #8a8170;
      }

      .status {
        min-height: 1.4rem;
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #6b6457;
      }
      .status.error { color: #c0392b; }

      .preview { margin: 2rem 0 0; }
      .preview img {
        max-width: 100%;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .download { margin-top: 1.25rem; }
      .download__label {
        margin: 0 0 0.25rem;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #8a8170;
      }
      .download__url {
        display: inline-block;
        word-break: break-all;
        font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
        font-size: 0.85rem;
        color: #c0562b;
      }
    </style>
  </head>
  <body data-slug="${slug}">
    <main>
      <h1 class="headline">
        <span class="caps">Upload</span>
        <span class="script">your</span>
        <span class="caps">Jerry</span>
        <span class="script">pic</span>
      </h1>

      <div class="dropzone" id="dropzone">
        <p class="dropzone__title">Drop a photo here, or click to choose</p>
        <p class="dropzone__hint">JPG or PNG</p>
        <input type="file" id="file" accept="image/png,image/jpeg" hidden />
      </div>

      <p class="status" id="status"></p>
      ${hasImage ? imageSection({ slug, downloadUrl }) : ''}
      ${hasImage ? imageSectionKindle({ slug, downloadUrl }) : ''}
    </main>
    <script src="/app.js"></script>
  </body>
</html>`

export default renderYoursPage
