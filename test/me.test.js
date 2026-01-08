/**
 * Integration tests for /api/me endpoints.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Me API', () => {
  beforeEach(async () => {
    await request(app).post('/api/reports/reset')
  })

  it('returns profile data', async () => {
    const res = await request(app).get('/api/me')
    expect(res.status).toBe(200)
    expect(res.body.email).toMatch(/@/)
    expect(res.body.preferences).toBeDefined()
  })

  it('updates preferences', async () => {
    const payload = { thresholds: { rainProbability: 0.8 } }
    const res = await request(app).put('/api/me/preferences').send(payload)
    expect(res.status).toBe(200)
    expect(res.body.thresholds.rainProbability).toBe(0.8)
  })
})
