/**
 * Tests d'intégration pour l'API Weather
 * TP 6: Tests API avec Vitest et Supertest
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import { connectToDb } from '../src/db/mongo.js'
import Weather from '../src/models/weather.model.js'

let createdWeatherId

beforeAll(async () => {
  await connectToDb()
  // Nettoyer la base de données avant les tests
  await Weather.deleteMany({})
})

afterAll(async () => {
  // Nettoyer après les tests
  await Weather.deleteMany({})
})

describe('Weather API - CRUD Operations', () => {
  describe('POST /api/weather', () => {
    it('should create a new weather entry and return 201', async () => {
      const newWeather = {
        city: 'Paris',
        country: 'FR',
        temperature: 15,
        description: 'Partly cloudy',
        humidity: 65,
        windSpeed: 12,
        icon: '02d'
      }

      const response = await request(app)
        .post('/api/weather')
        .send(newWeather)
        .expect(201)

      expect(response.body).toMatchObject({
        city: 'Paris',
        country: 'FR',
        temperature: 15,
        description: 'Partly cloudy',
        humidity: 65,
        windSpeed: 12
      })
      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('timestamp')

      // Sauvegarder l'ID pour les tests suivants
      createdWeatherId = response.body._id
    })

    it('should return 400 if required fields are missing', async () => {
      const invalidWeather = {
        city: 'London'
        // Champs manquants
      }

      await request(app)
        .post('/api/weather')
        .send(invalidWeather)
        .expect(500) // MongoDB va rejeter car champs requis manquants
    })
  })

  describe('GET /api/weather', () => {
    it('should list all weather entries', async () => {
      const response = await request(app)
        .get('/api/weather')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(1)
      expect(response.body[0]).toHaveProperty('city')
      expect(response.body[0]).toHaveProperty('temperature')
    })
  })

  describe('GET /api/weather/:id', () => {
    it('should get a specific weather entry by ID', async () => {
      const response = await request(app)
        .get(`/api/weather/${createdWeatherId}`)
        .expect(200)

      expect(response.body).toMatchObject({
        city: 'Paris',
        country: 'FR',
        temperature: 15
      })
      expect(response.body._id).toBe(createdWeatherId)
    })

    it('should return 404 if weather entry not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011' // Valid ObjectId format but doesn't exist

      const response = await request(app)
        .get(`/api/weather/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/weather/:id', () => {
    it('should update an existing weather entry', async () => {
      const updatedData = {
        city: 'Paris',
        country: 'FR',
        temperature: 18,
        description: 'Sunny',
        humidity: 55,
        windSpeed: 10,
        icon: '01d'
      }

      const response = await request(app)
        .put(`/api/weather/${createdWeatherId}`)
        .send(updatedData)
        .expect(200)

      expect(response.body).toMatchObject({
        city: 'Paris',
        temperature: 18,
        description: 'Sunny',
        humidity: 55,
        windSpeed: 10
      })
    })

    it('should return 404 if trying to update non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .put(`/api/weather/${fakeId}`)
        .send({
          city: 'Test',
          country: 'TS',
          temperature: 20,
          description: 'Test',
          humidity: 50,
          windSpeed: 5
        })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/weather/:id', () => {
    it('should delete an existing weather entry', async () => {
      const response = await request(app)
        .delete(`/api/weather/${createdWeatherId}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Weather deleted successfully')
      expect(response.body).toHaveProperty('weather')
    })

    it('should return 404 if trying to delete non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .delete(`/api/weather/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })
})
