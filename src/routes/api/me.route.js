/**
 * User profile & preference endpoints.
 */
import { Router } from 'express'
import { getUserProfile, updateUserPreferences } from '../../data/aetherData.js'

const router = Router()

router.get('/api/me', (_req, res) => {
  res.json(getUserProfile())
})

router.put('/api/me/preferences', (req, res) => {
  try {
    const updated = updateUserPreferences(req.body || {})
    res.json(updated.preferences)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
