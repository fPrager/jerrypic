import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { generateSlug, isValidSlug, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from './slug/index.js'
import { getImageHash, imageExists, loadImage, saveImage } from './storage/index.js'
import { convertToKindleJpeg } from './kindle/index.js'
import renderYoursPage from './renderYoursPage.js'

const MAX_BYTES = Number(process.env.MAX_BYTES) || 26214400

// public/ sits at the project root, one level up from both src/ (dev) and dist/ (prod).
const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

const first = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value)

const createApp = () => {
  const app = express()

  // Trust Caddy's forwarded headers so req.protocol is https in production.
  app.set('trust proxy', true)
  app.use(express.static(PUBLIC_DIR))

  // Capture the whole request body as a Buffer, regardless of content type,
  // so a web service can push raw image bytes directly.
  const rawImageBody = express.raw({ type: () => true, limit: MAX_BYTES })

  const requireValidSlug = (req: Request, res: Response, next: NextFunction): void => {
    if (!isValidSlug(req.params.slug)) {
      res.status(400).json({
        error: `slug must be ${SLUG_MIN_LENGTH}–${SLUG_MAX_LENGTH} characters of [A-Za-z0-9_-]`,
      })
      return
    }
    next()
  }

  // Landing: mint a fresh slug and forward to its upload page.
  app.get('/', (_req, res) => {
    res.redirect(`/yours/@${generateSlug()}`)
  })

  // Web frontend: the upload page for a slug, showing the current image if one exists.
  app.get('/yours/@:slug', requireValidSlug, async (req, res) => {
    const slug = first(req.params.slug) as string
    const origin = `${req.protocol}://${req.get('host')}`
    const downloadUrl = `${origin}/mine/@${slug}`
    const uploadUrl = `${origin}/yours/@${slug}`
    res.type('html').send(renderYoursPage({ slug, hasImage: await imageExists(slug), downloadUrl, uploadUrl }))
  })

  // Upload (or replace) the image for a slug. Body is the raw image bytes.
  app.post('/yours/@:slug', requireValidSlug, rawImageBody, async (req, res) => {
    const data = req.body as Buffer
    if (!Buffer.isBuffer(data) || data.length === 0) {
      res.status(400).json({ error: 'empty body — send the image bytes as the request body' })
      return
    }

    const slug = first(req.params.slug) as string
    const contentType = first(req.headers['content-type']) || 'application/octet-stream'
    await saveImage(slug, data, contentType)
    res.status(201).json({ slug, bytes: data.length, contentType })
  })

  // Download the stored image for a slug (the URL the Kindle fetches).
  app.get('/mine/@:slug', requireValidSlug, async (req, res) => {
    const image = await loadImage(first(req.params.slug) as string)
    if (!image) {
      res.status(404).json({ error: 'no image uploaded for this slug yet' })
      return
    }

    // Never cache, so the frontend preview and the Kindle always get the latest upload.
    res.set('Cache-Control', 'no-store')
    res.type(image.contentType).send(image.data)
  })

  // Kindle-ready variant of /mine: the stored image converted on the fly to the
  // grayscale JPEG at the resolution the device expects (see ./kindle).
  app.get('/mine/@:slug/kindle', requireValidSlug, async (req, res) => {
    const image = await loadImage(first(req.params.slug) as string)
    if (!image) {
      res.status(404).json({ error: 'no image uploaded for this slug yet' })
      return
    }

    // Jimp can only decode JPEG/PNG/BMP/GIF/TIFF — an unsupported upload (e.g. a
    // phone HEIC/WebP) throws here. Surface a clear error instead of a silent 500.
    try {
      const kindleJpeg = await convertToKindleJpeg(image.data)
      res.set('Cache-Control', 'no-store')
      res.type('image/jpeg').send(kindleJpeg)
    } catch (error) {
      console.error(`kindle conversion failed for @${first(req.params.slug)} (${image.contentType}):`, error)
      res.status(415).json({
        error: 'could not convert this image for the Kindle — upload a JPEG or PNG',
        contentType: image.contentType,
      })
    }
  })

  // SHA-256 of the currently stored image bytes, as plain hex. Precomputed at
  // upload time, so this poll-friendly route reads only the tiny sidecar — the
  // Kindle can ping it cheaply to check whether the image changed.
  app.get('/mine/@:slug/hash', requireValidSlug, async (req, res) => {
    const hash = await getImageHash(first(req.params.slug) as string)
    if (!hash) {
      res.status(404).json({ error: 'no image uploaded for this slug yet' })
      return
    }

    res.set('Cache-Control', 'no-store')
    res.type('text/plain').send(hash)
  })

  return app
}

export default createApp
