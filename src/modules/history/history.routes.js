import { Router } from 'express'
import { getHistory, clearHistory } from './history.controller.js'
import Joi from 'joi'

const router = Router()

// Validation Middleware simple
const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query)
  if (error) return res.status(400).json({ error: error.details[0].message })
  next()
}

const historySchema = Joi.object({
  userId: Joi.string().required().length(24),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('ALERT', 'ADVICE')
})

const deleteSchema = Joi.object({
  userId: Joi.string().required().length(24)
})

router.get('/', validateQuery(historySchema), getHistory)
router.delete('/', validateQuery(deleteSchema), clearHistory)

export default router
