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
   GET  /yours/@<slug>  → upload form                     │
   POST /yours/@<slug>  → store image          GET /mine/@<slug> → image bytes
                    │                                     │
                    ▼                                     ▼
        ┌──────────────────────────────────────────────────────────┐
        │              jerrypic-upload (Express, :3000)             │
        │   one image per slug, stored on a mounted disk volume     │
        └──────────────────────────────────────────────────────────┘
```

The slug is the only shared secret. Knowing it is enough to upload to and
download from that slot.

---

## Routes

| Method | Path                | Purpose                                                                 |
|--------|---------------------|-------------------------------------------------------------------------|
| `GET`  | `/yours/@:slug`     | Human-facing HTML page with an upload form; previews the current image. |
| `POST` | `/yours/@:slug`     | Store an image for this slug. Latest upload overwrites the previous.    |
| `GET`  | `/mine/@:slug`      | Return the stored image as-is (the URL the Kindle fetches). 404 if none.|

### Upload (`POST /yours/@:slug`)
Accepts **either**:
- a multipart form upload (field name `image`) — used by the HTML form, or
- a raw `image/*` request body — used by a web service pushing bytes directly.

### Slugs
- Pattern: `[A-Za-z0-9_-]`, 10–64 chars.
- **Created implicitly on first use** — any valid slug works; it "exists" once
  an image has been posted to it. No registration step.

### Auth
- **Open** — no auth. The slug itself is the secret. Suitable for a hobby setup.

---

## Storage

- **Local disk volume**, one current image per slug (latest upload wins).
- Image bytes live under `DATA_DIR` (default `/data`), with a small sidecar
  recording the MIME type so downloads return the correct `Content-Type`.
- `/mine/@:slug` serves the **raw, as-uploaded** bytes — no Kindle-side
  conversion (grayscale/resize) is done here. The uploader is responsible for
  providing a Kindle-friendly format if needed.

---

## Configuration

| Variable    | Default | Description                          |
|-------------|---------|--------------------------------------|
| `PORT`      | `3000`  | Port the Express server listens on.  |
| `DATA_DIR`  | `/data` | Directory where images are stored.   |
| `MAX_BYTES` | `26214400` (25 MB) | Max accepted upload size. |

No database and no external credentials are required.

---

## Tech stack

| Component   | Choice                          |
|-------------|---------------------------------|
| Runtime     | Node.js 20 (`node:20-alpine`)   |
| Framework   | Express 4                       |
| Uploads     | Multer (multipart) + raw body   |
| Storage     | Mounted Docker volume on disk   |
| Container   | Docker + Docker Compose         |
| Reverse proxy | Caddy (from the hosting stack)|

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
