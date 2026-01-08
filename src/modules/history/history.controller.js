import HistoryEntry from './history.model.js'

/**
 * GET /api/history
 * Récupère l'historique des alertes et conseils
 * Query Params:
 *  - userId (required)
 *  - page (default 1)
 *  - limit (default 20, max 100)
 *  - type (optional: 'ALERT', 'ADVICE')
 */
export async function getHistory (req, res, next) {
  try {
    const { userId, page = 1, limit = 20, type } = req.query

    if (!userId) return res.status(400).json({ error: 'Missing userId' })

    const query = { userId }
    if (type) query.type = type

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip = (pageNum - 1) * limitNum

    // Exécution en parallèle Count + Find
    const [total, items] = await Promise.all([
      HistoryEntry.countDocuments(query),
      HistoryEntry.find(query)
        .sort({ createdAt: -1 }) // Plus récent d'abord
        .skip(skip)
        .limit(limitNum)
        .lean()
    ])

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      items
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/history
 * Supprime tout l'historique d'un utilisateur (DEV ONLY)
 */
export async function clearHistory (req, res, next) {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'Missing userId' })

    // Sécurité basique pour ne pas nuker la prod par erreur (à adapter selon env)
    // if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Forbidden in production' });

    await HistoryEntry.deleteMany({ userId })
    res.json({ message: 'History cleared' })
  } catch (err) {
    next(err)
  }
}
