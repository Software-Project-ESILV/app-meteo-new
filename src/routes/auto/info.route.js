/**
 * GET /info → merges two small helpers for easy unit testing.
 * Returns: { name, version, node, uptime }
 */
/* eslint-disable */
const { Router } = require('express')
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

module.exports = router