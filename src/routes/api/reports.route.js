/**
 * Routes for weather reports CRUD-like operations.
 */
import { Router } from 'express'
import {
  addReport,
  listReports,
  listReportsNear,
  resetData,
  voteReport
} from '../../data/aetherData.js'

const router = Router()

function parseNumber (value, key, res) {
  const num = Number(value)
  if (Number.isNaN(num)) {
    res.status(400).json({ error: `${key} must be a valid number` })
    return null
  }
  return num
}

router.get('/api/reports', (_req, res) => {
  res.json(listReports())
})

router.get('/api/reports/near', (req, res) => {
  const { lat, lon, radius } = req.query
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'lat and lon are required' })
  }

  const latitude = parseNumber(lat, 'lat', res)
  if (latitude === null) return
  const longitude = parseNumber(lon, 'lon', res)
  if (longitude === null) return
  const radiusKm = radius !== undefined ? parseNumber(radius, 'radius', res) : 5
  if (radiusKm === null) return

  const results = listReportsNear(latitude, longitude, radiusKm)
  res.json({ count: results.length, reports: results })
})

router.post('/api/reports', (req, res) => {
  const { type, intensity, lat, lon, description } = req.body || {}
  if (!type || !intensity || lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'type, intensity, lat and lon are required' })
  }

  const latitude = Number(lat)
  const longitude = Number(lon)
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({ error: 'lat and lon must be numbers' })
  }

  const created = addReport({ type, intensity, lat: latitude, lon: longitude, description })
  res.status(201).json(created)
})

router.post('/api/reports/:id/vote', (req, res) => {
  const { id } = req.params
  const { value } = req.body || {}
  const reportId = Number(id)
  if (Number.isNaN(reportId)) {
    return res.status(400).json({ error: 'report id must be a number' })
  }
  if (value !== 1 && value !== -1) {
    return res.status(400).json({ error: 'value must be 1 or -1' })
  }

  const updated = voteReport(reportId, value)
  if (!updated) {
    return res.status(404).json({ error: 'report not found' })
  }
  res.json(updated)
})

// Utility endpoint to ease test resets (not exposed in prod routes).
router.post('/api/reports/reset', (_req, res) => {
  resetData()
  res.status(204).send()
})

export default router
