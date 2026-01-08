import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export async function connectToDb () {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB:', mongoose.connection.db.databaseName)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export function getDb () {
  return mongoose.connection.db
}
