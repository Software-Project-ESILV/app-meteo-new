import { generateAdvice } from './advice.service.js'

/**
 * GET /api/advice
 */
export async function getAdvice (req, res, next) {
  try {
    const { userId, lat, lon } = req.query

    const adviceList = await generateAdvice(userId, Number(lat), Number(lon))

    res.json({
      checkedAt: new Date(),
      location: { lat: Number(lat), lon: Number(lon) },
      advice: adviceList
    })
  } catch (err) {
    next(err)
  }
}
