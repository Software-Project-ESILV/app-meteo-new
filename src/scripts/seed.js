import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Weather from '../models/weather.model.js'
import path from 'path'
import { fileURLToPath } from 'url'

// Chargement des variables d'environnement
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../../.env') })

const cities = [
  { city: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, temp: 15, desc: 'Partly Cloudy', icon: '02d' },
  { city: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, temp: 12, desc: 'Rainy', icon: '09d' },
  { city: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, temp: 22, desc: 'Sunny', icon: '01d' },
  { city: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, temp: 19, desc: 'Clear Sky', icon: '01n' },
  { city: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, temp: 25, desc: 'Sunny', icon: '01d' },
  { city: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050, temp: 14, desc: 'Cloudy', icon: '03d' },
  { city: 'Rio de Janeiro', country: 'BR', lat: -22.9068, lon: -43.1729, temp: 30, desc: 'Hot', icon: '01d' },
  { city: 'Cape Town', country: 'ZA', lat: -33.9249, lon: 18.4241, temp: 20, desc: 'Windy', icon: '50d' },
  { city: 'Moscow', country: 'RU', lat: 55.7558, lon: 37.6173, temp: 5, desc: 'Snow', icon: '13d' },
  { city: 'Beijing', country: 'CN', lat: 39.9042, lon: 116.4074, temp: 18, desc: 'Haze', icon: '50d' },
  { city: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777, temp: 32, desc: 'Humid', icon: '02d' },
  { city: 'Cairo', country: 'EG', lat: 30.0444, lon: 31.2357, temp: 35, desc: 'Hot', icon: '01d' },
  { city: 'Los Angeles', country: 'US', lat: 34.0522, lon: -118.2437, temp: 28, desc: 'Sunny', icon: '01d' },
  { city: 'Toronto', country: 'CA', lat: 43.6510, lon: -79.3470, temp: 10, desc: 'Cloudy', icon: '03d' },
  { city: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708, temp: 40, desc: 'Scorching', icon: '01d' },
  { city: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198, temp: 31, desc: 'Thunderstorm', icon: '11d' },
  { city: 'Barcelona', country: 'ES', lat: 41.3851, lon: 2.1734, temp: 24, desc: 'Clear', icon: '01d' },
  { city: 'Rome', country: 'IT', lat: 41.9028, lon: 12.4964, temp: 26, desc: 'Sunny', icon: '01d' },
  { city: 'Istanbul', country: 'TR', lat: 41.0082, lon: 28.9784, temp: 20, desc: 'Partly Cloudy', icon: '02d' },
  { city: 'Bangkok', country: 'TH', lat: 13.7563, lon: 100.5018, temp: 33, desc: 'Hot', icon: '01d' },
  { city: 'Seoul', country: 'KR', lat: 37.5665, lon: 126.9780, temp: 17, desc: 'Rainy', icon: '09d' },
  { city: 'Mexico City', country: 'MX', lat: 19.4326, lon: -99.1332, temp: 22, desc: 'Cloudy', icon: '03d' },
  { city: 'Buenos Aires', country: 'AR', lat: -34.6037, lon: -58.3816, temp: 18, desc: 'Clear', icon: '01d' },
  { city: 'Lagos', country: 'NG', lat: 6.5244, lon: 3.3792, temp: 29, desc: 'Thunderstorm', icon: '11d' },
  { city: 'Jakarta', country: 'ID', lat: -6.2088, lon: 106.8456, temp: 31, desc: 'Rainy', icon: '10d' },
  { city: 'Lima', country: 'PE', lat: -12.0464, lon: -77.0428, temp: 20, desc: 'Foggy', icon: '50d' },
  { city: 'Sao Paulo', country: 'BR', lat: -23.5505, lon: -46.6333, temp: 25, desc: 'Cloudy', icon: '03d' },
  { city: 'Bogota', country: 'CO', lat: 4.7110, lon: -74.0721, temp: 15, desc: 'Rainy', icon: '09d' },
  { city: 'Johannesburg', country: 'ZA', lat: -26.2041, lon: 28.0473, temp: 18, desc: 'Clear', icon: '01d' },
  { city: 'Nairobi', country: 'KE', lat: -1.2921, lon: 36.8219, temp: 22, desc: 'Partly Cloudy', icon: '02d' },
  { city: 'Casablanca', country: 'MA', lat: 33.5731, lon: -7.5898, temp: 23, desc: 'Sunny', icon: '01d' },
  { city: 'Tehran', country: 'IR', lat: 35.6892, lon: 51.3890, temp: 25, desc: 'Clear', icon: '01d' },
  { city: 'Baghdad', country: 'IQ', lat: 33.3152, lon: 44.3661, temp: 38, desc: 'Hot', icon: '01d' },
  { city: 'Riyadh', country: 'SA', lat: 24.7136, lon: 46.6753, temp: 42, desc: 'Scorching', icon: '01d' },
  { city: 'Kuala Lumpur', country: 'MY', lat: 3.1390, lon: 101.6869, temp: 32, desc: 'Thunderstorm', icon: '11d' },
  { city: 'Manila', country: 'PH', lat: 14.5995, lon: 120.9842, temp: 30, desc: 'Humid', icon: '02d' },
  { city: 'Hanoi', country: 'VN', lat: 21.0285, lon: 105.8542, temp: 28, desc: 'Cloudy', icon: '03d' },
  { city: 'Taipei', country: 'TW', lat: 25.0330, lon: 121.5654, temp: 26, desc: 'Rainy', icon: '10d' },
  { city: 'Hong Kong', country: 'HK', lat: 22.3193, lon: 114.1694, temp: 29, desc: 'Partly Cloudy', icon: '02d' },
  { city: 'Shanghai', country: 'CN', lat: 31.2304, lon: 121.4737, temp: 22, desc: 'Cloudy', icon: '03d' },
  { city: 'Osaka', country: 'JP', lat: 34.6937, lon: 135.5023, temp: 20, desc: 'Clear', icon: '01d' },
  { city: 'Stockholm', country: 'SE', lat: 59.3293, lon: 18.0686, temp: 8, desc: 'Cold', icon: '13d' },
  { city: 'Oslo', country: 'NO', lat: 59.9139, lon: 10.7522, temp: 6, desc: 'Snow', icon: '13d' },
  { city: 'Helsinki', country: 'FI', lat: 60.1699, lon: 24.9384, temp: 5, desc: 'Cold', icon: '13d' },
  { city: 'Copenhagen', country: 'DK', lat: 55.6761, lon: 12.5683, temp: 10, desc: 'Rainy', icon: '09d' },
  { city: 'Amsterdam', country: 'NL', lat: 52.3676, lon: 4.9041, temp: 13, desc: 'Drizzle', icon: '09d' },
  { city: 'Brussels', country: 'BE', lat: 50.8503, lon: 4.3517, temp: 14, desc: 'Cloudy', icon: '03d' },
  { city: 'Vienna', country: 'AT', lat: 48.2082, lon: 16.3738, temp: 16, desc: 'Partly Cloudy', icon: '02d' },
  { city: 'Zurich', country: 'CH', lat: 47.3769, lon: 8.5417, temp: 12, desc: 'Rainy', icon: '09d' },
  { city: 'Lisbon', country: 'PT', lat: 38.7223, lon: -9.1393, temp: 22, desc: 'Sunny', icon: '01d' }
]

async function seed () {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected!')

    // S'assurer que l'index existe
    await Weather.ensureIndexes()

    console.log('Cleaning old data...')
    await Weather.deleteMany({})

    console.log(`Injecting ${cities.length} cities...`)

    const weatherData = cities.map(city => ({
      city: city.city,
      country: city.country,
      temperature: city.temp,
      description: city.desc,
      humidity: Math.floor(Math.random() * 50) + 30, // Random humidity
      windSpeed: Math.floor(Math.random() * 30), // Random wind
      icon: city.icon,
      location: {
        type: 'Point',
        coordinates: [city.lon, city.lat] // GeoJSON format: [lon, lat]
      }
    }))

    await Weather.insertMany(weatherData)

    console.log('Seed completed successfully! 🌱')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()
