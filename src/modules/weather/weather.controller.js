import Weather from './weather.model.js'
import { getForecastForLocation } from './weather.service.js'

export async function getForecast (req, res, next) {
  try {
    const { lat, lon } = req.query
    // Note: Validation Joi déjà faite par le middleware de route
    const data = await getForecastForLocation(lat, lon)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

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
    const { city, country, temperature, description, humidity, windSpeed, icon, latitude, longitude } = req.body

    let location
    if (latitude !== undefined && longitude !== undefined) {
      location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      }
    }

    const created = await Weather.create({
      city, country, temperature, description, humidity, windSpeed, icon, location
    })

    return res.status(201).json(created)
  } catch (err) {
    // ✅ si champs manquants → 400 (au lieu de 500)
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ error: true, message: err.message })
    }
    return next(err)
  }
}

export async function getWeatherNear (req, res, next) {
  try {
    const { lat, lon } = req.query
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude (lat) and Longitude (lon) are required' })
    }

    const nearbyWeather = await Weather.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lon), Number(lat)]
          }
        }
      }
    })

    if (!nearbyWeather) {
      return res.status(404).json({ message: 'No weather data found nearby' })
    }

    res.status(200).json(nearbyWeather)
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

export async function updateWeather (req, res, next) {
  try {
    const { city, country, temperature, description, humidity, windSpeed, icon } = req.body
    const weather = await Weather.findByIdAndUpdate(
      req.params.id,
      { city, country, temperature, description, humidity, windSpeed, icon },
      { new: true, runValidators: true }
    )
    if (!weather) {
      return res.status(404).json({ error: 'Weather not found' })
    }
    res.status(200).json(weather)
  } catch (err) {
    next(err)
  }
}

export async function deleteWeather (req, res, next) {
  try {
    const weather = await Weather.findByIdAndDelete(req.params.id)
    if (!weather) {
      return res.status(404).json({ error: 'Weather not found' })
    }
    res.status(200).json({ message: 'Weather deleted successfully', weather })
  } catch (err) {
    next(err)
  }
}
