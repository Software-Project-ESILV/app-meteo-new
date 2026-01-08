/**
 * API Client Centralisé
 * Simplifie les appels vers le backend Express
 */
const BASE_URL = '/api'

class ApiClient {
  async request (endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    const res = await fetch(url, { ...options, headers })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${res.status}`)
    }

    // Si status 204 (No Content) -> return null
    if (res.status === 204) return null
    return res.json()
  }

  get (endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url)
  }

  post (endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) })
  }

  put (endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) })
  }

  delete (endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
