/**
 * Modèle AlertRule
 * Définit les règles personnalisées de déclenchement d'alertes
 */
import mongoose from 'mongoose'

const alertRuleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    kind: {
      type: String,
      enum: ['RAIN_PROB', 'WIND', 'UV', 'AQI', 'TEMP'],
      required: true
    },
    op: {
      type: String,
      enum: ['>=', '<=', '>', '<', '=='],
      default: '>='
    },
    value: { type: Number, required: true },
    windowMinutes: { type: Number, default: 0 } // ex: "Si pluie > 50% dans les PROCHAINES 60 min"
  },
  channels: {
    inApp: { type: Boolean, default: true },
    webPush: { type: Boolean, default: false }
  },
  enabled: { type: Boolean, default: true },

  // Anti-spam : pour ne pas spammer l'alerte toutes les 5 min
  antiSpamMinutes: { type: Number, default: 60 },
  lastTriggeredAt: { type: Date }

}, {
  timestamps: true
})

const AlertRule = mongoose.models.AlertRule || mongoose.model('AlertRule', alertRuleSchema)
export default AlertRule
