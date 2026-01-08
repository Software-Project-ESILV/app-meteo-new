/**
 * Moteur d'Alertes Aether
 * Évalue les règles utilisateurs et gère le déclenchement (Anti-spam, Quiet Hours)
 */
import AlertRule from './alert.model.js'
import HistoryEntry from '../history/history.model.js'
import UserProfile from '../profiles/user.model.js'
import { addMinutes, isBefore } from 'date-fns'
import { sendPushToUser } from '../notifications/notification.service.js'

export const evaluateRules = async (userId, forecastCurrent, forecastHourly) => {
  const triggeredAlerts = []

  // 1. Charger Profil (pour Quiet Hours) & Règles
  const user = await UserProfile.findById(userId)
  if (!user) throw new Error('User not found')

  const rules = await AlertRule.find({ userId, enabled: true })
  if (rules.length === 0) return []

  // 2. Check Quiet Hours
  if (isQuietHour(user.quietHours)) {
    console.log(`[Alerts] Quiet Hours active for user ${userId}. Skipping alerts.`)
    return []
  }

  console.log(`[AlertsDebug] Evaluating ${rules.length} rules for user ${userId}`)

  // 3. Évaluation de chaque règle
  for (const rule of rules) {
    // DEBUG FORCE RESET
    // rule.lastTriggeredAt = null;

    // A. Check Anti-Spam
    if (rule.lastTriggeredAt) {
      const nextAllowedTime = addMinutes(rule.lastTriggeredAt, rule.antiSpamMinutes || 60)
      if (isBefore(new Date(), nextAllowedTime)) {
        console.log(`[AlertsDebug] Rule "${rule.name}" spammed (wait until ${nextAllowedTime})`)
        continue // Trop tôt pour re-déclencher
      }
    }

    // B. Check Condition
    const isTriggered = checkCondition(rule, forecastCurrent, forecastHourly)
    console.log(`[AlertsDebug] Rule "${rule.name}" => Triggered: ${isTriggered}`)

    if (isTriggered) {
      // C. Action !
      // Mise à jour date déclenchement
      rule.lastTriggeredAt = new Date()
      await rule.save()

      // Création payload alerte
      const alertPayload = {
        ruleId: rule._id,
        name: rule.name,
        condition: rule.condition,
        valueDetected: getValueFromCondition(rule.condition.kind, forecastCurrent),
        triggers: rule.lastTriggeredAt
      }

      // Log Historique
      await HistoryEntry.create({
        userId,
        type: 'ALERT',
        payload: alertPayload
      })

      // 🔔 PUSH NOTIFICATION
      if (rule.channels?.webPush !== false) { // Par défaut true si underspecified ou explicit true
        const notifPayload = {
          title: `⚠️ Alerte Aether: ${rule.name}`,
          body: `Dépassé: ${alertPayload.valueDetected} (Seuil ${rule.condition.value})`,
          icon: '/vite.svg', // Icone par défaut
          data: { url: '/dashboard' }
        }
        // Envoi non-bloquant
        sendPushToUser(userId, notifPayload).catch(e => console.error(e))
      }

      triggeredAlerts.push(alertPayload)
    }
  }

  return triggeredAlerts
}

// -- Helpers --

function isQuietHour (quietHours) {
  if (!quietHours || !quietHours.enabled) return false

  const now = new Date()
  const currentTimeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) // HH:mm

  // Gestion simple (sans timezone complexe pour MVP, on assume heure serveur = heure user ou UTC)
  // Idéalement faudrait gérer la TZ user.
  // Cas simple: start 22:00, end 07:00. Si il est 23:00 -> Oui. Si 06:00 -> Oui.
  // Cas jour: start 09:00, end 17:00.

  const start = quietHours.start
  const end = quietHours.end
  const current = currentTimeString

  if (start > end) { // Nuit (ex: 22h -> 07h)
    return current >= start || current <= end
  } else { // Jour (ex: 09h -> 17h)
    return current >= start && current <= end
  }
}

function checkCondition (rule, current, hourly) {
  const { kind, op, value, windowMinutes } = rule.condition

  let detectedValue = 0

  if (windowMinutes > 0 && hourly) {
    // Fenêtre future : on regarde le MAX sur la période
    const hoursToCheck = Math.max(1, Math.ceil(windowMinutes / 60))
    const slice = hourly.slice(0, hoursToCheck)

    if (kind === 'RAIN_PROB') detectedValue = Math.max(...slice.map(h => h.rainProb || 0))
    else if (kind === 'WIND') detectedValue = Math.max(...slice.map(h => h.windSpeed || 0))
    else if (kind === 'UV') detectedValue = Math.max(...slice.map(h => h.uv || 0))
    else if (kind === 'TEMP') detectedValue = Math.max(...slice.map(h => h.temp || 0)) // Ou moyenne ? Max pour alerte chaleur.
    else detectedValue = 0
  } else {
    // Instantané (Maintenant)
    // Note: RAIN_PROB et UV ne sont PAS dans 'current' OpenMeteo, ils sont dans hourly[0]
    if (kind === 'RAIN_PROB' || kind === 'UV') {
      const currentHour = hourly && hourly.length > 0 ? hourly[0] : null
      if (currentHour) {
        if (kind === 'RAIN_PROB') detectedValue = currentHour.rainProb || 0
        if (kind === 'UV') detectedValue = currentHour.uv || 0
      }
    } else {
      // TEMP et WIND sont dans current
      detectedValue = getValueFromCondition(kind, current)
    }
  }

  // DEBUG
  console.log(`[AlertsDebug] CheckCondition: Kind=${kind} Op=${op} Threshold=${value} Detected=${detectedValue} Window=${windowMinutes}`)

  // Comparaison
  switch (op) {
    case '>=': return detectedValue >= value
    case '>': return detectedValue > value
    case '<=': return detectedValue <= value
    case '<': return detectedValue < value
    case '==': return detectedValue === value
    default: return false
  }
}

function getValueFromCondition (kind, currentWeatherData) {
  if (!currentWeatherData) return 0
  switch (kind) {
    case 'TEMP': return currentWeatherData.temp
    case 'WIND': return currentWeatherData.windSpeed
    case 'UV': return 0 // Fallback si appel incorrect
    case 'RAIN_PROB': return 0 // Fallback
    default: return 0
  }
}
