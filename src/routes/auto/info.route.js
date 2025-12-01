/**
 * GET /info → merges two small helpers for easy unit testing.
 * Returns: { name, version, node, uptime }
 */
import { Router } from 'express'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const packageJson = require('../../../package.json')

const router = Router()

router.get('/info', (req, res) => {
  res.json({
    name: packageJson.name,
    version: packageJson.version,
    node: process.version,
    uptime: process.uptime()
  })
})

export default router
