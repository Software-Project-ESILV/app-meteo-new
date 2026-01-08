import { getForecastForLocation } from '../weather/weather.service.js'
import HistoryEntry from '../history/history.model.js'
import UserProfile from '../profiles/user.model.js'
import { subMinutes } from 'date-fns'

/**
 * Génère des conseils basés sur la météo et le profil
 */
export async function generateAdvice (userId, lat, lon) {
  // 1. Charger Profil ou Défaut
  let user = await UserProfile.findById(userId)
  if (!user) {
    user = {
      thresholds: { rainProb: 50, windKmh: 40, uvIndex: 6, coldTemp: 5, hotTemp: 30 },
      sensitivities: {}
    }
  }

  // 2. Météo fraîche (réutilise cache provider si dispo, ici appel direct)
  const forecast = await getForecastForLocation(lat, lon)
  const current = forecast.current
  const hourly = forecast.hourly

  const advices = []
  const th = user.thresholds || {}
  const sens = user.sensitivities || {}

  // -- RÈGLES --

  // A. PLUIE
  const rainThreshold = th.rainProb || 50
  const rainyHours = hourly.slice(0, 12).filter(h => h.rainProb >= rainThreshold)
  if (rainyHours.length > 0) {
    const firstRain = rainyHours[0]
    const maxProb = Math.max(...rainyHours.map(h => h.rainProb))
    const confidence = Math.min(1, maxProb / 100)

    advices.push({
      id: 'rain-risk',
      category: 'RAIN',
      title: 'Risque de Pluie',
      action: 'Emportez un parapluie ☔',
      reason: `Probabilité de pluie jusqu'à ${maxProb}% à partir de ${new Date(firstRain.time).getHours()}h.`,
      confidence
    })
  }

  // B. VENT
  const windThreshold = th.windKmh || 40
  if (current.windSpeed >= windThreshold) {
    advices.push({
      id: 'wind-risk',
      category: 'WIND',
      title: 'Vent Fort',
      action: 'Soyez prudent aux chutes d\'objets 💨',
      reason: `Vent actuel à ${current.windSpeed} km/h (Seuil: ${windThreshold}).`,
      confidence: 0.95
    })
  }

  // C. UV
  const uvThreshold = th.uvIndex || 6
  const uvHours = hourly.slice(0, 12).filter(h => (h.uv || 0) >= uvThreshold)
  if (uvHours.length > 0) {
    const maxUV = Math.max(...uvHours.map(h => h.uv))
    advices.push({
      id: 'uv-risk',
      category: 'UV',
      title: 'Indice UV Élevé',
      action: 'Mettez de la crème solaire et des lunettes 😎',
      reason: `L'indice UV atteindra ${maxUV} aujourd'hui.`,
      confidence: 0.9
    })
  }

  // D. FROID / CHAUD (Sensibilités)
  let coldThreshold = th.coldTemp || 5
  let hotThreshold = th.hotTemp || 30

  // Ajustement Sensibilité
  if (sens.cold) coldThreshold += 3 // Plus sensible au froid, on alerte plus tôt (ex: à 8° au lieu de 5°)
  if (sens.heat) hotThreshold -= 3 // Plus sensible au chaud, on alerte plus tôt (ex: à 27° au lieu de 30°)

  const nowTemp = current.temp

  if (nowTemp <= coldThreshold) {
    advices.push({
      id: 'cold-temp',
      category: 'COLD',
      title: sens.cold ? 'Froid (Sensible)' : 'Températures Basses',
      action: 'Habillez-vous chaudement 🧣',
      reason: `Il fait ${nowTemp}°C (Seuil: ${coldThreshold}°C).`,
      confidence: 1
    })
  } else if (nowTemp >= hotThreshold) {
    advices.push({
      id: 'heat-wave',
      category: 'HEAT',
      title: sens.heat ? 'Chaleur (Sensible)' : 'Forte Chaleur',
      action: 'Hydratez-vous régulièrement et évitez l\'effort 💧',
      reason: `Il fait ${nowTemp}°C (Seuil: ${hotThreshold}°C).`,
      confidence: 1
    })
  }

  // 3. Log History (Deduplication 30min)
  const validAdvices = []

  // Récupérer historique récent de type ADVICE pour ce user
  const recentLogs = await HistoryEntry.find({
    userId,
    type: 'ADVICE',
    createdAt: { $gte: subMinutes(new Date(), 30) }
  })

  const recentIds = new Set()
  recentLogs.forEach(entry => {
    if (entry.payload && entry.payload.id) recentIds.add(entry.payload.id)
  })

  for (const advice of advices) {
    // Ajouter à la liste de retour
    validAdvices.push(advice)

    // Sauvegarder en DB seulement si pas spam
    if (!recentIds.has(advice.id)) {
      await HistoryEntry.create({
        userId,
        type: 'ADVICE',
        payload: advice
      })
    }
  }

  return validAdvices
}
