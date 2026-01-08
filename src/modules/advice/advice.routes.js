import { Router } from 'express'
import { getAdvice } from './advice.controller.js'
import Joi from 'joi'

const router = Router()

const adviceSchema = Joi.object({
  userId: Joi.string().required().length(24),
  lat: Joi.number().required(),
  lon: Joi.number().required()
})

const validate = (req, res, next) => {
  const { error } = adviceSchema.validate(req.query)
  if (error) return res.status(400).json({ error: error.details[0].message })
  next()
}

router.get('/', validate, getAdvice)

export default router
