/**
 * Routes Profiles API
 */
import { Router } from 'express'
import Joi from 'joi'
import {
  getProfile,
  upsertProfile,
  addLocation,
  removeLocation
} from './profiles.controller.js'

const router = Router()

// -- Middleware de Validation --
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[property])
  if (error) return res.status(400).json({ error: error.details[0].message })
  next()
}

// Schemas Joi
const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  thresholds: Joi.object({
    rainProb: Joi.number().min(0).max(100),
    windKmh: Joi.number().min(0),
    uvIndex: Joi.number().min(0),
    aqi: Joi.number().min(0),
    pollenLevel: Joi.number().min(0)
  }),
  quietHours: Joi.object({
    enabled: Joi.boolean(),
    start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }),
  sensitivities: Joi.object({
    respiratory: Joi.boolean(),
    allergies: Joi.boolean(),
    heat: Joi.boolean(),
    cold: Joi.boolean()
  })
}).min(1) // Au moins un champ à update

const locationSchema = Joi.object({
  label: Joi.string().required().min(2),
  lat: Joi.number().required().min(-90).max(90),
  lon: Joi.number().required().min(-180).max(180),
  timezone: Joi.string().optional()
})

// -- Routes --

// GET /:userId
router.get('/:userId', getProfile)

// PUT /:userId (Upsert)
router.put('/:userId', validate(profileUpdateSchema), upsertProfile)

// POST /:userId/locations
router.post('/:userId/locations', validate(locationSchema), addLocation)

// DELETE /:userId/locations/:locationId
router.delete('/:userId/locations/:locationId', removeLocation)

export default router
