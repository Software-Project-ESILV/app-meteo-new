import Report from './report.model.js'

/**
 * Crée un signalement avec logique de déduplication spatio-temporelle.
 * Si un report du même type existe à < 1km et < 30min, on le renforce au lieu d'en créer un nouveau.
 */
export const createReportService = async (data) => {
  const { type, lat, lon, userId, description } = data

  // 1. Chercher doublon potentiel (Même type, < 1000m, < 30min)
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)

  const duplicate = await Report.findOne({
    type,
    createdAt: { $gte: thirtyMinAgo },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lon, lat] },
        $maxDistance: 1000 // 1km
      }
    }
  })

  if (duplicate) {
    // 2a. Fusion : On incrémente les confirmations
    duplicate.confirmations += 1
    duplicate.reliabilityScore += 2 // Bonus fiabilité
    duplicate.updatedAt = new Date() // Bump timestamp
    // On pourrait append la description si besoin, mais restons simple
    await duplicate.save()
    return { ...duplicate.toObject(), grouped: true }
  }

  // 2b. Création Nouveau
  const report = await Report.create({
    type,
    location: { type: 'Point', coordinates: [lon, lat] },
    userId,
    description,
    reliabilityScore: 1 // Score initial
  })

  return report
}

/**
 * Gestion du vote
 */
export const voteReportService = async (reportId, voteType) => {
  const inc = voteType === 'up' ? { 'votes.up': 1, reliabilityScore: 1 } : { 'votes.down': 1, reliabilityScore: -1 }
  const report = await Report.findByIdAndUpdate(reportId, { $inc: inc }, { new: true })
  return report
}
