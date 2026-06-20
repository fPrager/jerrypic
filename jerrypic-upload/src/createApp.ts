import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { generateSlug, isValidSlug, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from './slug/index.js'
import { getOutputHash, imageExists, loadImage, loadMeta, loadPipeline, saveImage, savePipeline } from './storage/index.js'
import { applyPipeline, getCatalog } from './pipeline/index.js'
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
  const jsonBody = express.json({ limit: '64kb' })

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

  // Web frontend: the pipeline editor page for a slug.
  app.get('/yours/@:slug', requireValidSlug, async (req, res) => {
    const slug = first(req.params.slug) as string
    const origin = `${req.protocol}://${req.get('host')}`
    const [hasImage, meta, pipeline] = await Promise.all([imageExists(slug), loadMeta(slug), loadPipeline(slug)])
    res.type('html').send(
      renderYoursPage({
        slug,
        hasImage,
        rawUrl: `${origin}/yours/@${slug}/raw`,
        outputUrl: `${origin}/mine/@${slug}`,
        pipeline,
        catalog: getCatalog(),
        rawWidth: meta?.width,
        rawHeight: meta?.height,
      }),
    )
  })

  // Upload (or replace) the raw source image for a slug. Body is the raw image bytes.
  app.post('/yours/@:slug/raw', requireValidSlug, rawImageBody, async (req, res) => {
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

  // Save the slug's transform pipeline. Body is the JSON step array; the server
  // validates/normalizes it and echoes the stored result.
  app.put('/yours/@:slug/pipeline', requireValidSlug, jsonBody, async (req, res) => {
    const slug = first(req.params.slug) as string
    const pipeline = await savePipeline(slug, req.body)
    res.json({ slug, pipeline })
  })

  // Serve the raw, as-uploaded source image (the left "Yours" preview).
  app.get('/yours/@:slug/raw', requireValidSlug, async (req, res) => {
    const image = await loadImage(first(req.params.slug) as string)
    if (!image) {
      res.status(404).json({ error: 'no image uploaded for this slug yet' })
      return
    }

    res.set('Cache-Control', 'no-store')
    res.type(image.contentType).send(image.data)
  })

  // The processed output: the source run through the slug's stored pipeline.
  // This is the URL the Kindle fetches.
  app.get('/mine/@:slug', requireValidSlug, async (req, res) => {
    const slug = first(req.params.slug) as string
    const image = await loadImage(slug)
    if (!image) {
      res.status(404).json({ error: 'no image uploaded for this slug yet' })
      return
    }

    // Jimp can only decode JPEG/PNG/BMP/GIF/TIFF — an unsupported upload (e.g. a
    // phone HEIC/WebP) throws here. Surface a clear error instead of a silent 500.
    try {
      const { buffer, contentType } = await applyPipeline(image.data, await loadPipeline(slug))
      res.set('Cache-Control', 'no-store')
      res.type(contentType).send(buffer)
    } catch (error) {
      console.error(`pipeline render failed for @${slug} (${image.contentType}):`, error)
      res.status(415).json({
        error: 'could not process this image — upload a JPEG or PNG',
        contentType: image.contentType,
      })
    }
  })

  // SHA-256 covering the raw image and the pipeline, as plain hex. Reads only the
  // sidecar (no render), so the Kindle can poll it cheaply and re-download when
  // either the photo or the steps change.
  app.get('/mine/@:slug/hash', requireValidSlug, async (req, res) => {
    const hash = await getOutputHash(first(req.params.slug) as string)
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
