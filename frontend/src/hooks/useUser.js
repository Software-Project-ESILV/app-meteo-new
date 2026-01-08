import { useState, useEffect } from 'react'
import { api } from '../services/api'

// ID "en dur" pour la démo si localStorage vide (correspond à un ObjectID valide)
const DEMO_ID_BASE = '507f1f77bcf86cd799439011'

export function useUser () {
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initUser()
  }, [])

  const initUser = async () => {
    let storedId = window.localStorage.getItem('aether_uid')

    // Si pas d'ID, on utilise l'ID de démo (pour simplifier le test sans Auth complexe)
    if (!storedId) {
      storedId = DEMO_ID_BASE
      window.localStorage.setItem('aether_uid', storedId)
    }

    setUserId(storedId)

    try {
      // On essaie de récupérer le profil
      const profile = await api.get(`/profiles/${storedId}`)
      setUserProfile(profile)
    } catch (err) {
      if (err.message.includes('404')) {
        // Si 404, on CRÉE le profil par défaut (Upsert)
        console.log('User not found, creating demo profile...')
        const defaultProfile = {
          name: 'Demo User',
          email: `demo_${Date.now()}@aether.app`,
          thresholds: { windKmh: 25, rainProb: 50, uvIndex: 6 }
        }
        const created = await api.put(`/profiles/${storedId}`, defaultProfile)
        setUserProfile(created)
      } else {
        console.error('Failed to init user', err)
      }
    } finally {
      setLoading(false)
    }
  }

  return { userId, userProfile, loading, refreshProfile: initUser }
}
