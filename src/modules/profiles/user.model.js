/**
 * Modèle UserProfile
 * Correspondance exacte PROMPT 3
 */
import mongoose from 'mongoose'

const userProfileSchema = new mongoose.Schema({
  // userId (string unique ou ObjectId) -> On utilise l'ObjectId auto de Mongo (_id)
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // unique mais optionnel

  // Lieux favoris (GeoJSON)
  favouriteLocations: [{
    label: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lon, lat]
    },
    timezone: { type: String, default: 'UTC' }
  }],

  // Seuils personnalisés pour les alertes
  thresholds: {
    rainProb: { type: Number, default: 50 }, // % de chance de pluie
    windKmh: { type: Number, default: 20 }, // Vent > 20 km/h
    uvIndex: { type: Number, default: 5 }, // UV > 5
    aqi: { type: Number, default: 3 }, // Qualité air
    pollenLevel: { type: Number, default: 2 }
  },

  // Quiet Hours (Ne pas déranger)
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' },
    end: { type: String, default: '07:00' }
  },

  // Sensibilités Santé (Booléens comme demandé)
  sensitivities: {
    respiratory: { type: Boolean, default: false }, // Asthme, etc.
    allergies: { type: Boolean, default: false }, // Pollen
    heat: { type: Boolean, default: false }, // Sensible forte chaleur
    cold: { type: Boolean, default: false } // Sensible froid (ajout perso utile)
  }
}, {
  timestamps: true // createdAt, updatedAt auto
})

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema)
export default UserProfile
