/**
 * Controller Profiles
 * Gestion unifiée des profils utilisateurs
 */
import UserProfile from './user.model.js'
import mongoose from 'mongoose'

/**
 * GET /api/profiles/:userId
 * Récupère un profil complet ou erreur 404
 */
export async function getProfile (req, res, next) {
  try {
    const { userId } = req.params
    // On cherche par userId (qui pourrait être un ID externe ou un ObjectID)
    // Ici on assume que userId dans l'URL correspond au champ _id si c'est un ObjectID valide,
    // sinon on pourrait adapter pour chercher par un champ custom "uid".
    // Pour simplifier et rester compatible mongo, on attend un ObjectID.

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid User ID format' })
    }

    const profile = await UserProfile.findById(userId)
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }
    res.json(profile)
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/profiles/:userId
 * Création ou Mise à jour (Upsert)
 */
export async function upsertProfile (req, res, next) {
  try {
    const { userId } = req.params
    const updateData = req.body

    // Protection: on ne veut pas modifier _id ou favouriteLocations directement via ce PUT global
    delete updateData._id
    delete updateData.favouriteLocations

    // Upsert
    // Si l'ID passé n'existe pas, on le créé s'il est valide ObjectID.
    // Hack: Mongoose permet de forcer _id lors de la création si on veut.

    // Simplification: On utilise findByIdAndUpdate. Si ID inexistant => Erreur (sauf si on générait l'ID nous même avant)
    // Mais "Upsert" sur un ID REST demande habituellement que le client connaisse l'ID.
    // Si c'est un nouveau user, le client devrait faire POST /profiles (ou le serveur génère ID).
    // ICI : On va supporter la logique "Si existe update, sinon create avec cet ID (si valide)".

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      // En vrai mode REST, on pourrait accepter un string arbitraire (ex: Auth0 ID).
      // Mais notre modèle UserProfile utilise l'ObjectId Mongo par défaut.
      return res.status(400).json({ error: 'Invalid User ID format for MongoDB' })
    }

    const profile = await UserProfile.findByIdAndUpdate(
      userId,
      { $set: updateData }, // Merge partiel
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.json(profile)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/profiles/:userId/locations
 * Ajoute une location favorite
 */
export async function addLocation (req, res, next) {
  try {
    const { userId } = req.params
    const { label, lat, lon, timezone } = req.body

    const newLoc = {
      label,
      location: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      timezone: timezone || 'UTC'
    }

    const profile = await UserProfile.findByIdAndUpdate(
      userId,
      { $push: { favouriteLocations: newLoc } },
      { new: true }
    )

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    res.status(201).json(profile.favouriteLocations)
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/profiles/:userId/locations/:locationId
 * Supprime une location
 */
export async function removeLocation (req, res, next) {
  try {
    const { userId, locationId } = req.params

    const profile = await UserProfile.findByIdAndUpdate(
      userId,
      { $pull: { favouriteLocations: { _id: locationId } } },
      { new: true }
    )

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    res.json(profile.favouriteLocations)
  } catch (err) {
    next(err)
  }
}
