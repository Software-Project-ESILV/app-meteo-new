import express from 'express'
import { requestLogger, errorHandler } from './middlewares/core.middleware.js'

// Modules Routes
import weatherRoutes from './modules/weather/weather.routes.js'
import profilesRoutes from './modules/profiles/profiles.routes.js'
import adviceRoutes from './modules/advice/advice.routes.js'
import alertsRoutes from './modules/alerts/alerts.routes.js'
import notificationRoutes from './modules/notifications/notification.routes.js'
import reportsRoutes from './modules/reports/report.routes.js'
import historyRoutes from './modules/history/history.routes.js'

const app = express()

// 1. Middlewares Globaux
app.use(express.json())
app.use(requestLogger)

// 2. Health Check
app.get('/health', (_req, res) => res.status(200).send('OK'))

// 3. Montage des Routes Modulaires
app.use('/api/weather', weatherRoutes)
app.use('/api/profiles', profilesRoutes)
app.use('/api/advice', adviceRoutes)
app.use('/api/alerts', alertsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/history', historyRoutes)

// 4. Gestion d'erreurs (doit être à la fin)
app.use(errorHandler)

export default app
