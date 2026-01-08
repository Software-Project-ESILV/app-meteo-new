/**
 * Service Provider pour Open-Meteo
 * Gère la communication avec l'API externe.
 */
import axios from 'axios'

class OpenMeteoProvider {
  constructor () {
    this.baseUrl = 'https://api.open-meteo.com/v1'
    this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1'
  }

  /**
     * Récupère les prévisions météo pour une localisation
     * @param {number} lat Latitude
     * @param {number} lon Longitude
     * @returns Données brutes de l'API Open-Meteo
     */
  async getForecast (lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          // Hourly: Temp, Pluie%, Code Météo, Vent, UV, Qualité air (approx via uv pour l'instant)
          hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index,relative_humidity_2m',
          // Daily: Min/Max, Lever/Coucher soleil, Max UV, Totale Pluie, Proba Pluie Max
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max',
          current_weather: true,
          timezone: 'auto'
        }
      })
      return response.data
    } catch (error) {
      console.error('[OpenMeteo] Forecast Error:', error.message)
      throw new Error('Failed to fetch external weather data')
    }
  }

  /**
     * Recherche une ville (Geocoding)
     * @param {string} name Nom de la ville
     * @returns {Promise<{name, country, lat, lon}>} Premier résultat trouvé ou null
     */
  async geocodeCity (name) {
    try {
      const response = await axios.get(`${this.geocodingUrl}/search`, {
        params: {
          name,
          count: 1,
          language: 'fr',
          format: 'json'
        }
      })

      const results = response.data.results
      if (!results || results.length === 0) return null

      const best = results[0]
      return {
        name: best.name,
        country: best.country,
        lat: best.latitude,
        lon: best.longitude
      }
    } catch (error) {
      console.error('[OpenMeteo] Search Error:', error.message)
      throw new Error('Failed to search city')
    }
  }
}

// Singleton instance
export const weatherProvider = new OpenMeteoProvider()
