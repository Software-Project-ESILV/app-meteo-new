
# API Documentation

Base URL: `/api`

## 🧠 Advice

### GET `/advice`
Génère et retourne les conseils météo basés sur le profil utilisateur.

**Query Params:**
*   `userId` (required): ObjectId du profil.
*   `lat` (required): Latitude.
*   `lon` (required): Longitude.

**Response (200 OK):**
```json
{
  "checkedAt": "2026-01-07T10:00:00Z",
  "location": { "lat": 48.85, "lon": 2.35 },
  "advice": [
    {
      "id": "cold-temp",
      "category": "COLD", // RAIN, WIND, UV, COLD, HEAT
      "title": "Températures Basses",
      "action": "Habillez-vous chaudement 🧣",
      "reason": "Il fait seulement 5°C.",
      "confidence": 1
    }
  ]
}
```

## 🚨 Alerts

### GET `/alerts/evaluate`
Déclenche manuellement l'évaluation des règles d'alerte.

**Query Params:** `userId`, `lat`, `lon`

**Response (200 OK):**
```json
{
  "checkedAt": "...",
  "triggeredCount": 1,
  "alerts": [
    {
      "ruleId": "...",
      "name": "Vent Fort",
      "valueDetected": 55,
      "condition": { "kind": "WIND", "op": ">", "value": 50 }
    }
  ]
}
```

### CRUD Rules (`/alerts/rules`)
*   `GET /?userId=...` : Liste les règles.
*   `POST /` : Créer une règle.
    *   Body: `{ userId, name, condition: { kind, op, value, windowMinutes } }`
*   `PUT /:id` : Modifier (ex: `{ enabled: false }`).
*   `DELETE /:id` : Supprimer.

## 👤 Profiles

### GET `/profiles/:userId`
Récupère le profil complet.

### PUT `/profiles/:userId`
Création ou Mise à jour (Upsert).

**Body Example:**
```json
{
  "name": "Max",
  "thresholds": {
    "rainProb": 50,
    "windKmh": 25,
    "coldTemp": 5
  },
  "sensitivities": {
    "cold": true
  },
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00"
  }
}
```

### Locations
*   `POST /profiles/:userId/locations` : Ajouter un lieu (`{ label, lat, lon }`).
*   `DELETE /profiles/:userId/locations/:locationId` : Supprimer un lieu.

## 📜 History

### GET `/history`
Récupère l'historique paginé.

**Query Params:**
*   `userId` (required)
*   `page` (def: 1), `limit` (def: 20)
*   `type` (optional: 'ALERT' | 'ADVICE')

**Response:**
```json
{
  "page": 1,
  "limit": 20,
  "total": 50,
  "items": [
    {
      "type": "ALERT",
      "payload": { ... },
      "createdAt": "..."
    }
  ]
}
```
