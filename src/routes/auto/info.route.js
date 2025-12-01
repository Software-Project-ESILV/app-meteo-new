/**
 * GET /info → merges two small helpers for easy unit testing.
 * Returns: { name, version, node, uptime }
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

router.get('/info', (req, res) => {
  res.json({
    name: packageJson.name,
    version: packageJson.version,
    node: process.version,
    uptime: process.uptime()
  })
})

export default router