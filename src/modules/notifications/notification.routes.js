import { Router } from 'express'
import { subscribeUser, getPublicKey } from './notification.service.js'

const router = Router()

// GET /api/notifications/vapid-key
// Le front a besoin de la clé publique pour s'abonner
router.get('/vapid-key', (req, res) => {
  // Note: Si généré dynamiquement, l'user doit copié collé la clé depuis la console vers le front
  // Ici on renvoie ce qu'on peut.
  res.json({ publicKey: getPublicKey() })
})

// POST /api/notifications/subscribe
router.post('/subscribe', async (req, res, next) => {
  try {
    const { userId, subscription } = req.body
    if (!userId || !subscription) return res.status(400).json({ error: 'Missing data' })

    await subscribeUser(userId, subscription)
    res.status(201).json({ message: 'Subscribed' })
  } catch (err) {
    next(err)
  }
})

export default router
