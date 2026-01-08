import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['FLOOD', 'ICE', 'STORM', 'ACCIDENT', 'OGRE', 'OTHER'], // OGRE = private joke ou event rare
    required: true
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lon, lat]
  },
  description: { type: String, maxlength: 280 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' }, // Optionnel (anonyme possible)
  mediaUrl: { type: String },

  // Système de vote / fiabilité
  votes: {
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 }
  },
  reliabilityScore: { type: Number, default: 0 }, // Calculé (ex: up - down + userReputation)
  confirmations: { type: Number, default: 1 }, // Nombre de signaleurs (Dédup)

  // Meta
  status: { type: String, enum: ['ACTIVE', 'RESOLVED', 'FALSE'], default: 'ACTIVE' }
}, {
  timestamps: true
})

// Index Géospatial pour la map
reportSchema.index({ location: '2dsphere' })
// Index pour purge auto après X temps
reportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // Auto-delete après 24h

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema)
export default Report
