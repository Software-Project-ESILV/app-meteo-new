import mongoose from 'mongoose'

const meteoSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    country: { type: String, required: true },
    temperature: { type: Number, required: true },
    description: { type: String, required: true },
    humidity: { type: Number },
    windSpeed: { type: Number },
    pressure: { type: Number },
    icon: { type: String },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.model('Meteo', meteoSchema, 'Meteo')
