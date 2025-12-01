/**
 * GET /api/forecast → serves a minimal forecast payload with static advice.
 */
import { Router } from 'express'

const router = Router()

router.get('/api/forecast', (req, res) => {
  const { lat, lon } = req.query

  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'lat and lon query params are required' })
  }

  const latitude = Number(lat)
  const longitude = Number(lon)
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({ error: 'lat and lon must be valid numbers' })
  }

  const payload = {
    coords: { lat: latitude, lon: longitude },
    summary: 'Light showers approaching',
    temperature: { current: 12, feelsLike: 10 },
    precipitation: { probability: 0.62, nextHourMm: 0.8 },
    advice: 'Prends ton parapluie dans 20 minutes'
  }

  res.status(200).json(payload)
})

export default router
