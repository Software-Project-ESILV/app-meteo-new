import express from 'express'
import { errorHandler } from './utils/errorHandler.js'
import weatherRoutes from './routes/weather.routes.js'

const app = express()

<<<<<<< HEAD
// Enable JSON parsing for API routes before mounting routers
app.use(express.json())

// Simple root + health endpoints
app.get('/', (_req, res) => res.json({ ok: true, message: 'Hello from CI/CD demo 👋' }))
app.get('/health', (_req, res) => res.status(200).send('OK'))

// Load route collections (auto + api) to keep responsibilities isolated
const routeFolders = ['auto', 'api']
for (const folder of routeFolders) {
  const dirPath = path.join(__dirname, 'routes', folder)
  if (!fs.existsSync(dirPath)) continue
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.route.js'))
  for (const f of files) {
    try {
      const full = path.join(dirPath, f)
      const module = require(full)
      const router = module.default || module
      if (router) app.use('/', router)
    } catch (error) {
      console.error(`Failed to load route ${folder}/${f}:`, error)
      throw error
    }
  }
}
=======
// Parser JSON
app.use(express.json())

// Routes de base
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Hello from app-meteo-new' })
})
>>>>>>> feature/DEVOPS-2-info-endpoint

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

// Routes météo
app.use('/api/weather', weatherRoutes)

// Middleware d'erreur en dernier
app.use(errorHandler)

export default app
