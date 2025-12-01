/**
 * Integration tests for /api/forecast.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('GET /api/forecast', () => {
  it('returns 400 when coords missing', async () => {
    const res = await request(app).get('/api/forecast')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/lat and lon/i)
  })

  it('returns forecast payload when coords provided', async () => {
    const res = await request(app).get('/api/forecast?lat=48.85&lon=2.29')
    expect(res.status).toBe(200)
    expect(res.body.coords).toEqual({ lat: 48.85, lon: 2.29 })
    expect(res.body.precipitation.probability).toBeGreaterThan(0)
    expect(typeof res.body.advice).toBe('string')
  })
})
