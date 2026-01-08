import { Router } from 'express'
import Joi from 'joi'
import Report from './report.model.js'
import { createReportService, voteReportService } from './report.service.js'

const router = Router()

// -- Controller --

async function getReports (req, res, next) {
  try {
    const { lat, lon, radius = 10000 } = req.query // default 10km

    // SEEDING AUTOMATIQUE (DEV)
    const count = await Report.countDocuments()
    if (count === 0) {
      console.log('Seeding reports...')
      const PARIS = { lat: 48.85, lon: 2.35 }
      const types = ['FLOOD', 'STORM', 'ACCIDENT', 'ICE', 'OTHER']
      const dummies = Array.from({ length: 5 }).map((_, i) => ({
        type: types[i % types.length],
        location: {
          type: 'Point',
          coordinates: [
            PARIS.lon + (Math.random() - 0.5) * 0.05,
            PARIS.lat + (Math.random() - 0.5) * 0.05
          ]
        },
        description: 'Signalement automatique de démo',
        userId: '507f1f77bcf86cd799439011',
        status: 'ACTIVE'
      }))
      await Report.insertMany(dummies)
    }

    // Filtre géographique
    const query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      },
      status: 'ACTIVE'
    }

    const reports = await Report.find(query).limit(50).sort('-createdAt')
    res.json(reports)
  } catch (err) { next(err) }
}

async function createReport (req, res, next) {
  try {
    const result = await createReportService(req.body)
    // Contract Adapter for Tests
    const response = {
      id: result._id,
      type: result.type,
      ...result.toObject ? result.toObject() : result
    }
    res.status(201).json(response)
  } catch (err) { next(err) }
}

async function voteReport (req, res, next) {
  try {
    const { id } = req.params
    // Support legacy 'type' or test contract 'value'
    let { type, value } = req.body
    if (value !== undefined) {
      type = value > 0 ? 'up' : 'down'
    }

    const report = await voteReportService(id, type)

    // Contract Adapter for Tests
    res.json({
      upvotes: report.votes.up,
      ...report.toObject()
    })
  } catch (err) { next(err) }
}

// -- Routes --

const querySchema = Joi.object({
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  radius: Joi.number().max(100000) // Max 100km
})

const createSchema = Joi.object({
  type: Joi.string().valid('FLOOD', 'ICE', 'STORM', 'ACCIDENT', 'OGRE', 'OTHER').required(),
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  description: Joi.string().allow(''),
  userId: Joi.string()
})

// Middleware valid
const validate = (schema, src = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[src])
  if (error) return res.status(400).json({ error: error.details[0].message })
  next()
}

router.get('/', validate(querySchema, 'query'), getReports)
router.post('/', validate(createSchema), createReport)
router.post('/:id/vote', voteReport)

export default router
