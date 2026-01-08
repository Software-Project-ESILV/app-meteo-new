/**
 * Tests d'intégration API Profiles
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import { connectToDb } from '../src/db/mongo.js'
import UserProfile from '../src/modules/profiles/user.model.js'
import mongoose from 'mongoose'

let testUserId

beforeAll(async () => {
  await connectToDb()
  await UserProfile.deleteMany({}) // Clean init

  // Générer un ID Mongo valide
  testUserId = new mongoose.Types.ObjectId().toString()
})

afterAll(async () => {
  await UserProfile.deleteMany({}) // Clean exit
})

describe('Profiles API', () => {
  // 1. PUT (UPSERT) - Création Nouveau Profil
  it('PUT /api/profiles/:id should create a new profile (upsert)', async () => {
    const payload = {
      name: 'Agent Aether',
      email: 'agent@aether.app',
      thresholds: {
        windKmh: 45
      }
    }

    const res = await request(app)
      .put(`/api/profiles/${testUserId}`)
      .send(payload)
      .expect(200)

    expect(res.body.name).toBe('Agent Aether')
    expect(res.body.thresholds.windKmh).toBe(45)
    // Vérifier les valeurs par défaut
    expect(res.body.quietHours.enabled).toBe(false)
  })

  // 2. GET
  it('GET /api/profiles/:id should return the profile', async () => {
    const res = await request(app)
      .get(`/api/profiles/${testUserId}`)
      .expect(200)

    expect(res.body._id).toBe(testUserId)
    expect(res.body.email).toBe('agent@aether.app')
  })

  // 3. POST Location
  it('POST /api/profiles/:id/locations should add a favorite place', async () => {
    const locPayload = {
      label: 'Secret Base',
      lat: 48.85,
      lon: 2.35
    }

    const res = await request(app)
      .post(`/api/profiles/${testUserId}/locations`)
      .send(locPayload)
      .expect(201)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].label).toBe('Secret Base')
    expect(res.body[0].location.type).toBe('Point')
  })

  // 4. Validation Joi (Erreur)
  it('PUT /api/profiles/:id should fail with invalid email', async () => {
    await request(app)
      .put(`/api/profiles/${testUserId}`)
      .send({ email: 'not-an-email' })
      .expect(400)
  })
})
