import { useState, useEffect } from 'react'
import { api } from '../services/api'

// Fonction utilitaire pour convertir la clé VAPID base64 en Uint8Array
function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications (userId) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Vérifier si déjà abonné au chargement
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub)
        })
      })
    }
  }, [])

  const subscribe = async () => {
    if (!userId) return window.alert('User not initialized')

    try {
      // 1. Register SW
      const registration = await navigator.serviceWorker.register('/sw.js')

      // 2. Get Key from Server
      const { publicKey } = await api.get('/notifications/vapid-key')
      if (publicKey === 'CHECK_SERVER_LOGS') {
        throw new Error('VAPID Key not found. Check server console.')
      }

      // 3. Subscribe Browser
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      // 4. Send to Backend
      await api.post('/notifications/subscribe', { userId, subscription })

      setIsSubscribed(true)
      console.log('Push Subscribed !')
    } catch (err) {
      console.error('Subscription failed', err)
      setError(err.message)
      window.alert('Erreur Push: ' + err.message)
    }
  }

  return { isSubscribed, subscribe, error }
}
