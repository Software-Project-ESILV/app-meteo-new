/**
 * Routes for weather CRUD operations
 * TP 6: Construction de l'API REST
 */
import { Router } from 'express'
import Joi from 'joi'
import {
  listWeather,
  createWeather,
  getWeatherById,
  updateWeather,
  deleteWeather,
  getWeatherNear,
  getForecast
} from './weather.controller.js'

const router = Router()

// Validation Middleware
const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query)
  if (error) return next(error)
  next()
}

const coordsSchema = Joi.object({
  lat: Joi.number().required().min(-90).max(90),
  lon: Joi.number().required().min(-180).max(180)
})

// GET /forecast - Prévisions complètes (OpenMeteo)
router.get('/forecast', validateQuery(coordsSchema), getForecast)

// GET /nearest - Trouver la météo la plus proche
router.get('/nearest', validateQuery(coordsSchema), getWeatherNear)

// GET / - Liste toutes les données météo
router.get('/', listWeather)

// GET /:id - Récupère une info spécifique
router.get('/:id', getWeatherById)

// POST / - Ajoute une nouvelle donnée météo
router.post('/', createWeather)

// PUT /:id - Met à jour une donnée existante
router.put('/:id', updateWeather)

// DELETE /:id - Supprime une donnée
router.delete('/:id', deleteWeather)

export default router
