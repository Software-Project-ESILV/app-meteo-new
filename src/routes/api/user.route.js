import { Router } from 'express'
import {
  createUser,
  getUserProfile,
  updatePreferences,
  addLocation
} from '../../controllers/user.controller.js'

const router = Router()

// Crée un utilisateur
router.post('/api/users', createUser)

// Récupère un profil (par ID MongoDB pour l'instant)
router.get('/api/users/:id', getUserProfile)

// Met à jour les prefs
router.put('/api/users/:id/preferences', updatePreferences)

// Ajoute un favori
router.post('/api/users/:id/locations', addLocation)

export default router
