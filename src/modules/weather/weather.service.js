/**
 * Weather Service
 * Couche d'abstraction métier pour la météo.
 */
import { weatherProvider } from '../../providers/openMeteo.provider.js'

export const getForecastForLocation = async (lat, lon) => {
  const raw = await weatherProvider.getForecast(lat, lon)

  // Normalisation des données pour le front
  // MAPPING ENRICHI
  return {
    location: {
      lat: raw.latitude,
      lon: raw.longitude,
      timezone: raw.timezone
    },
    checkedAt: new Date().toISOString(),
    current: {
      temp: raw.current_weather.temperature,
      conditionCode: raw.current_weather.weathercode,
      windSpeed: raw.current_weather.windspeed,
      description: wmoCodeToText(raw.current_weather.weathercode),
      // Données supplémentaires via hourly[0] car current_weather est limité
      humidity: raw.hourly.relative_humidity_2m[0],
      precipitation: raw.hourly.precipitation_probability[0],
      uv: raw.hourly.uv_index[0]
    },
    daily: raw.daily.time.map((date, i) => ({
      date,
      maxTemp: raw.daily.temperature_2m_max[i],
      minTemp: raw.daily.temperature_2m_min[i],
      rainProbMax: raw.daily.precipitation_probability_max[i],
      sunrise: raw.daily.sunrise[i],
      sunset: raw.daily.sunset[i],
      code: raw.daily.weather_code[i]
    })).slice(0, 7),
    hourly: raw.hourly.time.map((time, i) => ({
      time,
      temp: raw.hourly.temperature_2m[i],
      rainProb: raw.hourly.precipitation_probability[i],
      humidity: raw.hourly.relative_humidity_2m[i],
      code: raw.hourly.weather_code[i]
    })).slice(0, 24) // 24 prochaines heures
  }
}

// Helper simple pour convertir les codes WMO en texte lisible
function wmoCodeToText (code) {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Heavy Thunderstorm'
  }
  return codes[code] || 'Unknown'
}
