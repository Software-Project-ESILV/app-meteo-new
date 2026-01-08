import express from 'express'
import { listWeather, createWeather, getWeatherById } from '../controllers/weather.controller.js'

const router = express.Router()

router.get('/', listWeather)
router.post('/', createWeather)
router.get('/:id', getWeatherById)

export default router
