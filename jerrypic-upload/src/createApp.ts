import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { isValidSlug, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from './slug/index.js'
import { loadImage, saveImage } from './storage/index.js'

const MAX_BYTES = Number(process.env.MAX_BYTES) || 26214400

const first = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value)

const createApp = () => {
  const app = express()

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

  app.get('/', (_req, res) => {
    res.send('Hello from jerrypic-upload!\n')
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

    res.type(image.contentType).send(image.data)
  })

  return app
}

export default createApp
