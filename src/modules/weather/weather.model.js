import mongoose from 'mongoose'

const weatherSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  temperature: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  windSpeed: {
    type: Number,
    required: true,
    min: 0
  },
  icon: {
    type: String,
    default: '01d'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Créer un index géospatial pour permettre les recherches de proximité
weatherSchema.index({ location: '2dsphere' })

// Vérifier si le modèle existe déjà pour éviter l'erreur OverwriteModelError
const Weather = mongoose.models.Weather || mongoose.model('Weather', weatherSchema)

export default Weather
