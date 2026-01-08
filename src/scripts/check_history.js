import mongoose from 'mongoose'
import HistoryEntry from '../modules/history/history.model.js'

// Connexion temporaire
mongoose.connect('mongodb://localhost:27017/aether-db').then(async () => {
  console.log('Connected to DB')
  const entries = await HistoryEntry.find({}).sort({ createdAt: -1 }).limit(1)
  console.log(JSON.stringify(entries, null, 2))
  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
})
