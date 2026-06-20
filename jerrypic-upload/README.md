# jerrypic-upload

A small Express service that lets you upload a photo from a web page (or push it
programmatically), and exposes a stable download URL that a Kindle can fetch.

Both sides share a **slug** — a short key that ties an upload to its download URL.

- Part of the [jerrypic](https://github.com/fPrager/jerrypic) project.
- Deployed via the [vps-hosting-stack](../../06.07-project-hosting-infrastructure).

---

## How it works

```
        ┌─────────────────────────┐         ┌─────────────────────────┐
        │  Browser / web service  │         │         Kindle          │
        │      (the uploader)     │         │     (the consumer)      │
        └───────────┬─────────────┘         └────────────┬────────────┘
                    │                                     │
   GET  /yours/@<slug>        → editor page               │
   POST /yours/@<slug>/raw    → store source     GET /mine/@<slug> → processed output
   PUT  /yours/@<slug>/pipeline → save steps              │
                    │                                     │
                    ▼                                     ▼
        ┌──────────────────────────────────────────────────────────┐
        │              jerrypic-upload (Express, :3000)             │
        │   raw source + a transform pipeline, per slug, on disk    │
        └──────────────────────────────────────────────────────────┘
```

Each slug holds a **raw source image** plus a **pipeline** of image transforms.
`/mine/@<slug>` serves the source run through that pipeline — that is the URL the
Kindle fetches. The slug is the only shared secret.

---

## Routes

| Method | Path                       | Purpose                                                                       |
| ------ | -------------------------- | ----------------------------------------------------------------------------- |
| `GET`  | `/yours/@:slug`            | The editor page: source preview, the pipeline editor, and the output preview. |
| `POST` | `/yours/@:slug/raw`        | Store the raw source image for this slug. Latest upload wins.                  |
| `GET`  | `/yours/@:slug/raw`        | Return the raw, as-uploaded source bytes. 404 if none.                         |
| `PUT`  | `/yours/@:slug/pipeline`   | Save the slug's transform pipeline (JSON step array). Returns the normalized steps. |
| `GET`  | `/mine/@:slug`             | Return the source run through the pipeline (what the Kindle fetches). 404 if none.  |
| `GET`  | `/mine/@:slug/hash`        | SHA-256 covering the source **and** the pipeline, as plain hex. 404 if none.   |

### Upload (`POST /yours/@:slug/raw`)

Send the raw image bytes as the request body (any `Content-Type`). JPEG and PNG
are supported; other formats (AVIF/HEIC/WebP) are stored but can't be processed,
so `/mine` returns `415`.

### Slugs

- Pattern: `[A-Za-z0-9_-]`, 10–64 chars.
- **Created implicitly on first use** — any valid slug works; it "exists" once
  an image has been posted to it. No registration step.

### Auth

- **Open** — no auth. The slug itself is the secret. Suitable for a hobby setup.

---

## Pipeline

The output is produced by an ordered list of **steps**, edited on the page and
stored per slug. The last step is always the **target format** (default JPEG).

- Available transforms: `resize`, `rotate`, `flip`, `crop`, `autocrop`,
  `greyscale`, `invert`, `contrast`, `brightness`, `normalize`, `threshold`,
  `dither`, plus the `format` target.
- A new slug defaults to `greyscale → rotate(-90) → jpeg`. Everything the Kindle
  needs (e.g. a resize to the device resolution) is added as editable steps —
  nothing is hardcoded.
- The server validates every saved pipeline against the step registry: unknown
  step types are dropped, parameters are coerced/clamped, and a single target
  step is guaranteed. The editor builds its UI from the same registry
  (`/yours/@:slug` injects the catalog), so frontend and backend never drift.
- Steps run with [Jimp](https://github.com/jimp-dev/jimp); it decodes
  JPEG/PNG/BMP/GIF/TIFF only.

## Storage

- **Local disk volume**, one source image + sidecar per slug.
- Bytes live under `DATA_DIR` (default `/data`). The JSON sidecar records the
  `contentType`, the source `hash`, the raw `width`/`height` (so the editor can
  default a resize to the source size), and the `pipeline`.
- `/mine/@:slug` renders **per request**; the raw upload is never modified, and
  re-uploading a photo keeps the configured pipeline.
- `/mine/@:slug/hash` is computed from the source hash + pipeline definition
  (no render), so the Kindle can poll cheaply and re-download only when the photo
  **or** the steps change.

---

## Configuration

| Variable    | Default            | Description                         |
| ----------- | ------------------ | ----------------------------------- |
| `PORT`      | `3000`             | Port the Express server listens on. |
| `DATA_DIR`  | `/data`            | Directory where images are stored.  |
| `MAX_BYTES` | `26214400` (25 MB) | Max accepted upload size.           |

No database and no external credentials are required.

---

## Tech stack

| Component     | Choice                          |
| ------------- | ------------------------------- |
| Runtime       | Node.js 22 (`node:22-alpine`)   |
| Framework     | Express 5                       |
| Uploads       | Raw request body                |
| Image engine  | Jimp (pure JS, no native deps)  |
| Storage       | Mounted Docker volume on disk   |
| Container     | Docker + Docker Compose         |
| Reverse proxy | Caddy (from the hosting stack)  |

---

## Files (planned)

```
jerrypic-upload/
├── index.js             # Express app: the three routes above
├── package.json         # express, multer
├── Dockerfile           # node:20-alpine, EXPOSE 3000
├── docker-compose.yml   # joins external hosting_shared network, mounts jerrypic_upload_data:/data
├── .env.example
└── README.md            # this file
```

---

## Deployment

Hosted on the VPS hosting stack, which routes a whole subdomain to one container
via Caddy. Path routing (`/yours`, `/mine`) is handled **inside** the Express
app — Caddy just forwards the subdomain.

1. Add to `vps-hosting-stack/services.yml`:
   ```yaml
   jerrypic-upload:
     repo: git@github.com:fPrager/jerrypic.git
     path: jerrypic-upload
     domain: a-jerry-pic.that-will-be.com
     container: jerrypic-upload
     port: 3000
     # no db_name — uses a disk volume, not Postgres
   ```
2. Deploy:
   ```bash
   ./scripts/deploy-service.sh jerrypic-upload
   ```
   This clones/updates the repo, builds the container, writes the Caddy snippet
   (`a-jerry-pic.that-will-be.com → jerrypic-upload:3000`), and reloads Caddy.
   TLS is provisioned automatically.

DNS for `a-jerry-pic` is already covered by the `*.that-will-be.com` wildcard
record.

---

## Local development

```bash
npm install
DATA_DIR=./data PORT=3000 npm start
# upload form:  http://localhost:3000/yours/@test
# kindle URL:   http://localhost:3000/mine/@test
```
