# Aether - Météo, Alertes & Communauté

Aether est une application météo intelligente qui va au-delà des simples prévisions. Elle fournit des conseils personnalisés, des alertes en temps réel, un historique détaillé et une carte communautaire des incidents.

## Fonctionnalités Clés

- **Tableau de Bord Météo** : Prévisions précises (API Open-Meteo), conditions actuelles et indicateurs clés (UV, Vent, Pluie).
- **Conseils Intelligents** : Recommandations basées sur votre profil (ex: "Prenez un parapluie", "Risque UV élevé").
- **Système d'Alertes** : Définissez vos propres seuils (Vent > 50km/h, Pluie > 80%) et recevez des notifications.
- **Carte Communautaire** : Signalez et visualisez les incidents (Inondations, Verglas, Accidents) autour de vous.
- **Historique** : Retrouvez toutes vos alertes et conseils passés.

## Stack Technique

- **Frontend** : React, Vite, Tailwind CSS (via variables), Leaflet (Cartes), Lucide React (Icônes).
- **Backend** : Node.js, Express.
- **Base de Données** : MongoDB.
- **Provider Météo** : Open-Meteo (Gratuit, Open Source).

## Installation

### Pré-requis
- Node.js (v18+)
- MongoDB (local ou distant)

### 1. Backend
```bash
# À la racine (le backend est à la racine de ce dossier)
npm install
cp .env.example .env
# Configurez .env si nécessaire (MongoDB URI, etc.)
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Par défaut VITE_API_URL=http://localhost:3000
```

## Lancement

**Terminal 1 (Backend)**
```bash
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```

## Utilisation Rapide (Démo)

1. **Accueil** : Ouvrez l'application. La météo se charge selon votre position (ou Paris par défaut).
2. **Conseils** : Voyez les conseils générés par l'IA (algo).
3. **Paramètres** : Allez dans "Paramètres", configurez des seuils d'alerte (ex: Pluie > 0%).
4. **Alertes** : Lancez une simulation ("Tester") ou attendez la prochaine maj météo.
5. **Incidents** : Allez sur la page "Carte", signalez un "Verglas".
6. **Historique** : Consultez l'onglet "Dashboard/Historique" pour voir les logs.

*Note : Pour la démo, un `userId` de test est généré automatiquement dans le LocalStorage.*

## Linting & Qualité

Le projet suit des règles strictes de qualité de code (ESLint).

```bash
# Backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Auteurs
Albert SOUYRIS
Adam TOUCHANE
Amine MEGHAGHI
Saber BERREHILI
