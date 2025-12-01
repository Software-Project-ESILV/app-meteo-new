/**
 * Express app configuration.
 * Responsibilities:
 *  - Base routes (/, /health)
 *  - Auto-mount all routers in src/routes/auto/*.route.js
 *  - Global error handler (consistent JSON for errors)
 */
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { errorHandler } from './utils/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

const app = express()

// Enable JSON parsing for API routes before mounting routers
app.use(express.json())

// Simple root + health endpoints
app.get('/', (_req, res) => res.json({ ok: true, message: 'Hello from CI/CD demo 👋' }))
app.get('/health', (_req, res) => res.status(200).send('OK'))

// Load route collections (auto + api) to keep responsibilities isolated
const routeFolders = ['auto', 'api']
for (const folder of routeFolders) {
  const dirPath = path.join(__dirname, 'routes', folder)
  if (!fs.existsSync(dirPath)) continue
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.route.js'))
  for (const f of files) {
    try {
      const full = path.join(dirPath, f)
      const module = require(full)
      const router = module.default || module
      if (router) app.use('/', router)
    } catch (error) {
      console.error(`Failed to load route ${folder}/${f}:`, error)
      throw error
    }
  }
}

// Global error middleware last
app.use(errorHandler)

export default app
