import webpush from 'web-push'
import PushSubscription from './notification.model.js'

// ⚠️ EN PROD : Mettre ça dans .env
// Pour la démo, on génère si pas défini, MAIS il faut que le Front ait la même clé publique.
// Donc on va forcer une paire de clés de test ici.

// Si pas de clés en env, on prévient
if (!process.env.VAPID_PUBLIC_KEY) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ [VAPID] Aucune clé VAPID définie. Les notifications push ne marcheront pas tant que vous ne mettez pas des clés valides dans le .env ou le code.')
  }
  // Générer un set pour aider le dev
  const keys = webpush.generateVAPIDKeys()
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ VOICI DES CLÉS GÉNÉRÉES À COPIER :')
    console.log('VAPID_PUBLIC_KEY=' + keys.publicKey)
    console.log('VAPID_PRIVATE_KEY=' + keys.privateKey)
  }

  // On utilise celles-ci pour la session courante
  webpush.setVapidDetails(
    'mailto:admin@aether.app',
    keys.publicKey,
    keys.privateKey
  )
} else {
  webpush.setVapidDetails(
    'mailto:admin@aether.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export const subscribeUser = async (userId, subscription) => {
  // On sauvegarde l'abonnement en base (upsert)
  await PushSubscription.findOneAndUpdate(
    { userId, endpoint: subscription.endpoint },
    { ...subscription, userId },
    { upsert: true, new: true }
  )
}

export const sendPushToUser = async (userId, payload) => {
  try {
    const subs = await PushSubscription.find({ userId })

    // On envoie à tous les devices de l'user
    const notifications = subs.map(sub => {
      return webpush.sendNotification(sub, JSON.stringify(payload))
        .catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription expirée / invalide -> On nettoie
            PushSubscription.deleteOne({ _id: sub._id })
          } else {
            console.error('[WebPush] Send Error', err)
          }
        })
    })

    await Promise.all(notifications)
    return true
  } catch (err) {
    console.error('[WebPush] Global Error', err)
    return false
  }
}

export const getPublicKey = () => {
  // Hack pour récupérer la clé utilisée (si générée dynamiquement)
  // web-push n'expose pas de getter simple, c'est pourquoi il faut les stocker.
  // Pour ce MVP si généré dynamiquement, il faudra regarder la console serveur.
  return process.env.VAPID_PUBLIC_KEY || 'CHECK_SERVER_LOGS'
}
