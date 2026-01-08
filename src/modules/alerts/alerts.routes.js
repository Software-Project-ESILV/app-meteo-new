import { Router } from 'express'
import Joi from 'joi'
import {
  evaluateUserAlerts,
  listRules,
  createRule,
  updateRule,
  deleteRule
} from './alerts.controller.js'

const router = Router()

// Validation
const validate = (schema, type = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[type])
  if (error) return res.status(400).json({ error: error.details[0].message })
  next()
}

const ruleSchema = Joi.object({
  userId: Joi.string().required().length(24),
  name: Joi.string().required(),
  condition: Joi.object({
    kind: Joi.string().valid('RAIN_PROB', 'WIND', 'UV', 'AQI', 'TEMP').required(),
    op: Joi.string().valid('>=', '<=', '>', '<', '==').default('>='),
    value: Joi.number().required(),
    windowMinutes: Joi.number().default(0)
  }).required(),
  enabled: Joi.boolean(),
  antiSpamMinutes: Joi.number()
})

const evalSchema = Joi.object({
  userId: Joi.string().required().length(24),
  lat: Joi.number().required(),
  lon: Joi.number().required()
})

// Evaluation (Simulation / Check manuel)
router.get('/evaluate', validate(evalSchema, 'query'), evaluateUserAlerts)

// CRUD
router.get('/rules', listRules)
router.post('/rules', validate(ruleSchema), createRule)
router.put('/rules/:id', updateRule)
router.delete('/rules/:id', deleteRule)

export default router
