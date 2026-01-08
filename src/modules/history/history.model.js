/**
 * Modèle HistoryEntry
 * Log chaque conseil ou alerte généré pour l'utilisateur
 */
import mongoose from 'mongoose'

const historyEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['ADVICE', 'ALERT'],
    required: true
  },
  // Payload flexible (Mixed) pour stocker tout type de données contextuelles
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Index composé pour requêtes rapides "Donne moi l'historique récent de cet User"
    index: -1
  }
})

// Index composite (userId + createdAt desc)
historyEntrySchema.index({ userId: 1, createdAt: -1 })

const HistoryEntry = mongoose.models.HistoryEntry || mongoose.model('HistoryEntry', historyEntrySchema)
export default HistoryEntry
