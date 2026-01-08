import User from '../models/user.model.js'

/**
 * Crée un nouvel utilisateur
 * POST /api/users
 */
// ... (imports)

/**
 * Crée un nouvel utilisateur
 * POST /api/users
 */
export async function createUser (req, res, next) {
  try {
    const { username, email } = req.body

    // Validation basique
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' })
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] })
    if (exists) {
      return res.status(409).json({ error: 'User already exists' })
    }

    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
}

/**
 * Récupère un profil utilisateur
 * GET /api/users/:id
 */
export async function getUserProfile (req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

/**
 * Met à jour les préférences utilisateur (Sensibilités, Quiet Hours)
 * PUT /api/users/:id/preferences
 */
export async function updatePreferences (req, res, next) {
  try {
    const { thresholds, quietHours, sensitivities } = req.body

    // On utilise $set pour mettre à jour ponctuellement sans tout écraser
    const updateData = {}
    if (sensitivities) updateData.sensitivities = sensitivities
    if (quietHours) updateData.quietHours = quietHours
    if (thresholds) updateData.thresholds = thresholds

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

/**
 * Ajoute un lieu favori
 * POST /api/users/:id/locations
 */
export async function addLocation (req, res, next) {
  try {
    const { name, lat, lon } = req.body
    if (!name || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: 'Name, lat and lon are required' })
    }

    const locationObj = {
      name,
      coords: {
        type: 'Point',
        coordinates: [lon, lat]
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { locations: locationObj } },
      { new: true }
    )

    res.json(user.locations)
  } catch (err) {
    next(err)
  }
}
