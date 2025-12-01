/**
 * GET /version → { version: "<package.json version>" }
 * Reads version from package.json to keep it source-of-truth.
 */
import { Router } from 'express'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(
  await readFile(path.join(__dirname, '../../../package.json'), 'utf-8')
)

const router = Router()

router.get('/version', (req, res) => {
  res.json({ version: packageJson.version })
})

export default router

