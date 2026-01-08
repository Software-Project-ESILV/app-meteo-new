/**
 * Middleware Core Aether
 * Gestion des logs et des erreurs globale
 */

// Logger simple structuré
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }
    // Colorisation simple pour la console
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m' // Rouge erreur, Vert succès
    console.log(`${color}[Aether] ${log.method} ${log.url} ${log.status} - ${log.duration}\x1b[0m`)
  })
  next()
}

// Gestionnaire d'erreurs Global
export const errorHandler = (err, req, res, next) => {
  console.error('[Global Error]', err)

  // Erreur de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details.map(d => d.message)
    })
  }

  // Erreur MongoDB (Duplicata)
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      field: Object.keys(err.keyPattern)[0]
    })
  }

  // Erreur par défaut
  const status = err.status || 500
  res.status(status).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong'
  })
}
