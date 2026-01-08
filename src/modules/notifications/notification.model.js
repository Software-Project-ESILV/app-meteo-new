import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
    index: true
  },
  // L'objet standard PushSubscription du navigateur
  endpoint: { type: String, required: true },
  expirationTime: { type: Number, default: null },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  }
}, { timestamps: true })

const PushSubscription = mongoose.models.PushSubscription || mongoose.model('PushSubscription', subscriptionSchema)
export default PushSubscription
