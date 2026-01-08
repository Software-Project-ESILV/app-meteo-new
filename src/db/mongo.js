import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export async function connectToDb () {
  if (process.env.NODE_ENV === 'test') {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    const mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri)
    console.log('Connected to In-Memory MongoDB for Tests')
  } else {
    try {
      await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/aether-app')
      console.log('Connected to MongoDB:', mongoose.connection.db.databaseName)
    } catch (error) {
      console.error('MongoDB connection error:', error)
      throw error // Laissez l'erreur remonter pour qu'on sache si ça plante
    }
  }
}

export function getDb () {
  return mongoose.connection.db
}
