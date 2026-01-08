/**
 * Integration tests for /api/reports routes.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Reports API', () => {
  beforeEach(async () => {
    await request(app).post('/api/reports/reset')
  })

  it('lists reports near coordinates', async () => {
    const res = await request(app).get('/api/reports/near?lat=48.85&lon=2.29&radius=10')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.reports)).toBe(true)
    expect(res.body.reports.length).toBeGreaterThan(0)
  })

  it('creates a new report', async () => {
    const payload = { type: 'hail', intensity: 'light', lat: 48.86, lon: 2.35, description: 'Grêle légère' }
    const res = await request(app).post('/api/reports').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.type).toBe('hail')
  })

  it('votes on a report', async () => {
    const createRes = await request(app).post('/api/reports').send({ type: 'fog', intensity: 'dense', lat: 43.6, lon: 1.44 })
    const reportId = createRes.body.id
    const voteRes = await request(app).post(`/api/reports/${reportId}/vote`).send({ value: 1 })
    expect(voteRes.status).toBe(200)
    expect(voteRes.body.upvotes).toBeGreaterThan(0)
  })
})
