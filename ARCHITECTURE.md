# 🏗️ Architecture du Projet Météo (MERN Stack)

Ce document explique comment les différentes parties de l'application fonctionnent ensemble, du clic de l'utilisateur jusqu'à la base de données.

---

## 🌍 Vue d'ensemble (Le "Big Picture")

L'application suit une architecture **Client-Serveur** classique utilisant la stack **MERN** :
- **M**ongoDB (Base de données)
- **E**xpress (Serveur Backend)
- **R**eact (Interface Frontend)
- **N**ode.js (Environnement d'exécution)

```mermaid
graph LR
    User[👤 Utilisateur] -->|Interagit| Front[🖥️ Frontend (React)]
    Front -->|Requêtes HTTP /api| Back[⚙️ Backend (Express)]
    Back -->|Queries Mongoose| DB[(🗄️ MongoDB)]
    Back -->|Réponse JSON| Front
    Front -->|Affichage| User
```

---

## 1. 🗄️ La Base de Données (MongoDB)

C'est la mémoire de l'application. Elle stocke les villes et leurs météos.

- **Fichier clé :** `src/models/weather.model.js`
- **Technologie :** MongoDB + Mongoose (ODM).
- **Structure :** Chaque ville est un "Document" JSON.
- **Spécialité :** Nous utilisons un index **GeoSpatial (`2dsphere`)** sur le champ `location`. Cela permet à MongoDB de faire des calculs géométriques (comme "trouve le point le plus proche de ces coordonnées").

---

## 2. ⚙️ Le Backend (Node.js + Express)

C'est le chef d'orchestre. Il sécurise l'accès aux données et traite les demandes.

### Comment ça marche ?
1. **Serveur (`src/index.js`)** : Point d'entrée, il lance le serveur sur le port `3000` et se connecte à MongoDB.
2. **Routes (`src/routes/api/weather.route.js`)** : Ce sont les "portes" de l'API.
   - `GET /api/weather` : "Donne-moi tout".
   - `GET /api/weather/nearest` : "Donne-moi le plus proche".
3. **Contrôleurs (`src/controllers/weather.controller.js`)** : C'est le cerveau.
   - La fonction `getWeatherNear` reçoit une latitude/longitude, demande à Mongoose de chercher avec `$near`, et renvoie le résultat.

---

## 3. 🖥️ Le Frontend (React + Vite)

C'est la partie visible (l'interface utilisateur). Elle tourne sur le port `5173`.

- **Fichier clé :** `frontend/src/App.jsx`
- **Proxy :** Dans `vite.config.js`, nous avons configuré un **Proxy**.
  - Quand React fait une requête vers `/api/...`, Vite la redirige automatiquement vers `http://localhost:3000`.
  - Cela évite les erreurs de sécurité CORS (Cross-Origin Resource Sharing).

---

## 🔄 Le Flux "Magic Search" (Exemple concret)

Voici ce qui se passe exactement quand vous tapez **"Versailles"** dans la barre de recherche :

1. **Saisie (Frontend) :**
   - Vous tapez "Versailles" et cliquez sur "Search".
   - Le composant `WeatherSearch` s'active.

2. **Géocodage (Frontend -> API externe) :**
   - React demande à *Open-Meteo* : "Où est Versailles ?".
   - *Open-Meteo* répond : `{ lat: 48.80, lon: 2.13 }`.

3. **Appel API (Frontend -> Backend) :**
   - React envoie une requête à *votre* serveur :
     `GET /api/weather/nearest?lat=48.80&lon=2.13`

4. **Traitement (Backend -> Database) :**
   - Express reçoit la requête.
   - Il demande à MongoDB : "Trouve-moi la ville la plus proche de ces coordonnées".
   - MongoDB utilise son index spatial et trouve **"Paris"** (qui est à ~15km).

5. **Réponse (Database -> Backend -> Frontend) :**
   - MongoDB renvoie l'objet "Paris" au Backend.
   - Le Backend le renvoie au Frontend en JSON.
   - React reçoit les données de Paris et met à jour l'affichage (`setWeatherData`).

---

# 🛠️ Tutoriels API & Persistance

Cette section explique comment utiliser l'API manuellement (via Postman, curl ou ThunderClient).

### 1. Ajouter une ville (POST)
C'est ici que la **persistance** se fait. Quand vous envoyez ces données, elles sont **écrites sur le disque dur de la base de données**. Même si vous redémarrez le serveur, la ville sera toujours là.

- **URL :** `POST http://localhost:3000/api/weather`
- **Body (JSON) :**
```json
{
  "city": "Marseille",
  "country": "FR",
  "temperature": 22,
  "description": "Sunny",
  "humidity": 40,
  "windSpeed": 15,
  "latitude": 43.2965,
  "longitude": 5.3698
}
```

### 2. Récupérer toutes les villes (GET)
- **URL :** `GET http://localhost:3000/api/weather`
- **Réponse :** Une liste (Array) de toutes les villes stockées en base.

### 3. Trouver la ville la plus proche (GET)
C'est la fonctionnalité de géolocalisation.
- **URL :** `GET http://localhost:3000/api/weather/nearest?lat=43.3&lon=5.4`
- **Réponse :** L'objet JSON de la ville la plus proche (dans cet exemple : Marseille).
