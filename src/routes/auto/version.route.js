/**
 * GET /version → { version: "<package.json version>" }
 * Reads version from package.json to keep it source-of-truth.
 */
import { Router } from 'express'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const packageJson = require('../../../package.json')

const router = Router()
router.get('/version', (req, res) => {
  res.json({ version: packageJson.version })
})
export default router
