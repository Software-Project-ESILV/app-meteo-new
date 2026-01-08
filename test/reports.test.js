import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { connectToDb } from '../src/db/mongo.js'
import Report from '../src/modules/reports/report.model.js'
import request from 'supertest'
import app from '../src/app.js'

describe('Reports API', () => {
  beforeAll(async () => {
    await connectToDb()
    await Report.ensureIndexes()
  })

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
    const payload = { type: 'ICE', lat: 48.86, lon: 2.35, description: 'Grêle légère', userId: '507f1f77bcf86cd799439011' }
    const res = await request(app).post('/api/reports').send(payload)
    if (res.status !== 201) console.log('Create Report Error:', res.body)
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.type).toBe('ICE')
  })

  it('votes on a report', async () => {
    const createRes = await request(app).post('/api/reports').send({ type: 'OTHER', lat: 43.6, lon: 1.44, userId: '507f1f77bcf86cd799439011' })
    console.log('Vote Create Status:', createRes.status)
    if (createRes.status !== 201) console.log('Vote Create Error:', createRes.body)
    const reportId = createRes.body.id || createRes.body._id
    console.log('ReportId:', reportId)
    const voteRes = await request(app).post(`/api/reports/${reportId}/vote`).send({ value: 1 })
    expect(voteRes.status).toBe(200)
    expect(voteRes.body.upvotes).toBeGreaterThan(0)
  })
})
