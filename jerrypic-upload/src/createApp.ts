import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { generateSlug, isValidSlug, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from './slug/index.js'
import { imageExists, loadImage, saveImage } from './storage/index.js'
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
    const downloadUrl = `${req.protocol}://${req.get('host')}/mine/@${slug}`
    res.type('html').send(renderYoursPage({ slug, hasImage: await imageExists(slug), downloadUrl }))
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

  return app
}

export default createApp
