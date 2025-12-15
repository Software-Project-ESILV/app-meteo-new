import Weather from '../models/weather.model.js'

export async function listWeather (req, res, next) {
  try {
    const data = await Weather.find().lean()
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

export async function createWeather (req, res, next) {
  try {
    const { city, country, temperature, description, humidity, windSpeed, icon } = req.body
    const created = await Weather.create({ city, country, temperature, description, humidity, windSpeed, icon })
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function getWeatherById (req, res, next) {
  try {
    const weather = await Weather.findById(req.params.id)
    if (!weather) {
      return res.status(404).json({ error: 'Weather not found' })
    }
    res.status(200).json(weather)
  } catch (err) {
    next(err)
  }
}
