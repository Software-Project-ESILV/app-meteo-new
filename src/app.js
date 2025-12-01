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
import { errorHandler } from './utils/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Simple root + health endpoints
app.get('/', (_req, res) => res.json({ ok: true, message: 'Hello from CI/CD demo 👋' }))
app.get('/health', (_req, res) => res.status(200).send('OK'))

// Fonction pour charger les routes de manière asynchrone
async function loadRoutes () {
  const autoDir = path.join(__dirname, 'routes', 'auto')
  if (fs.existsSync(autoDir)) {
    const files = fs.readdirSync(autoDir).filter(f => f.endsWith('.route.js'))
    for (const f of files) {
      try {
        const full = path.join(autoDir, f)
        const module = await import(full)
        const router = module.default || module
        if (router) app.use('/', router)
      } catch (error) {
        console.error(`Failed to load route ${f}:`, error)
      }
    }
  }
}

// Charger les routes
loadRoutes().catch(console.error)

// Global error middleware last
app.use(errorHandler)

export default app
