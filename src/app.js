import express from 'express'
import { errorHandler } from './utils/errorHandler.js'
import weatherRoutes from './routes/weather.routes.js'

const app = express()

// Parser JSON
app.use(express.json())

// Routes de base
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Hello from app-meteo-new' })
})

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

// Routes météo
app.use('/api/weather', weatherRoutes)

// Middleware d'erreur en dernier
app.use(errorHandler)

export default app
