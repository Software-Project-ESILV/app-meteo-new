/**
 * In-memory storage used by the new TP5 API routes.
 * Data is intentionally simple and resettable for deterministic tests.
 */

const baseReports = [
  {
    id: 1,
    type: 'rain',
    intensity: 'moderate',
    description: 'Pluie fine sur Paris 15e',
    lat: 48.8422,
    lon: 2.3039,
    upvotes: 1,
    downvotes: 0,
    createdAt: '2025-12-01T09:45:00Z'
  },
  {
    id: 2,
    type: 'wind',
    intensity: 'strong',
    description: 'Rafales sur Toulouse',
    lat: 43.6045,
    lon: 1.4442,
    upvotes: 0,
    downvotes: 0,
    createdAt: '2025-12-01T09:50:00Z'
  }
]

const basePreferences = {
  quietHours: { start: '22:00', end: '07:00' },
  thresholds: { rainProbability: 0.6, uv: 7 },
  notifications: { channels: ['push'], maxPerDay: 6 }
}

let reports = cloneReports(baseReports)
let nextReportId = reports.length + 1

const userProfile = {
  id: 'user-demo-1',
  email: 'alice@example.com',
  locale: 'fr-FR',
  persona: 'Cyclist',
  preferences: clonePreferences(basePreferences)
}

function cloneReports (list) {
  return list.map(report => ({ ...report }))
}

function clonePreferences (prefs) {
  return JSON.parse(JSON.stringify(prefs))
}

export function resetData () {
  reports = cloneReports(baseReports)
  nextReportId = reports.length + 1
  userProfile.preferences = clonePreferences(basePreferences)
}

export function listReports () {
  return reports
}

export function addReport ({ type, intensity, lat, lon, description }) {
  const report = {
    id: nextReportId++,
    type,
    intensity,
    description: description ?? '',
    lat,
    lon,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString()
  }
  reports.push(report)
  return report
}

function haversineKm (lat1, lon1, lat2, lon2) {
  const toRad = deg => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function listReportsNear (lat, lon, radiusKm = 5) {
  return reports.filter(report => haversineKm(lat, lon, report.lat, report.lon) <= radiusKm)
}

export function voteReport (id, value) {
  const report = reports.find(r => r.id === id)
  if (!report) return null
  if (value === 1) report.upvotes += 1
  if (value === -1) report.downvotes += 1
  return report
}

export function getUserProfile () {
  return userProfile
}

export function updateUserPreferences (partial = {}) {
  if (typeof partial !== 'object' || Array.isArray(partial)) {
    throw new Error('Invalid preferences payload')
  }

  const current = userProfile.preferences
  userProfile.preferences = {
    ...current,
    ...partial,
    quietHours: partial.quietHours
      ? { ...current.quietHours, ...partial.quietHours }
      : current.quietHours,
    thresholds: partial.thresholds
      ? { ...current.thresholds, ...partial.thresholds }
      : current.thresholds,
    notifications: partial.notifications
      ? { ...current.notifications, ...partial.notifications }
      : current.notifications
  }

  return userProfile
}
