import AlertRule from './alert.model.js'

import { evaluateRules } from './alerts.service.js'
import { getForecastForLocation } from '../weather/weather.service.js'

/**
 * GET /api/alerts/evaluate
 * Déclenche l'évaluation des règles pour un user (Simule le cronjob)
 */
export async function evaluateUserAlerts (req, res, next) {
  try {
    const { userId, lat, lon } = req.query

    // 1. Météo fraîche nécessaire
    const forecast = await getForecastForLocation(lat, lon)

    // 2. Run Engine
    const alerts = await evaluateRules(userId, forecast.current, forecast.hourly)

    res.json({
      checkedAt: new Date(),
      triggeredCount: alerts.length,
      alerts
    })
  } catch (err) {
    next(err)
  }
}

// -- CRUD RÈGLES --

export async function listRules (req, res, next) {
  try {
    const { userId } = req.query
    const rules = await AlertRule.find({ userId })
    res.json(rules)
  } catch (err) { next(err) }
}

export async function createRule (req, res, next) {
  try {
    const rule = await AlertRule.create(req.body)
    res.status(201).json(rule)
  } catch (err) { next(err) }
}

export async function updateRule (req, res, next) {
  try {
    const rule = await AlertRule.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!rule) return res.status(404).json({ error: 'Rule not found' })
    res.json(rule)
  } catch (err) { next(err) }
}

export async function deleteRule (req, res, next) {
  try {
    const rule = await AlertRule.findByIdAndDelete(req.params.id)
    if (!rule) return res.status(404).json({ error: 'Rule not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}
