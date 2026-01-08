// public/sw.js

/* eslint-env serviceworker */

self.addEventListener('push', function (event) {
  if (event.data) {
    const payload = event.data.json()
    console.log('[Service Worker] Push Received:', payload)

    // Affichage de la notif système
    const promiseChain = self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/vite.svg',
      data: payload.data // URL à ouvrir
    })

    event.waitUntil(promiseChain)
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})
