# Changelog

## [1.0.0] - 2026-01-08

### Added
- **Météo** : Intégration API Open-Meteo (Forecast Hourly/Daily).
- **Frontend** : Dashboard React complet avec Tailwind CSS.
- **Alertes** : Moteur de règles personnalisables (Seuils Vent, Pluie, UV, Température).
- **Conseils** : Génération de conseils basés sur la météo et le profil.
- **Carte** : Module Leaflet pour signalement d'incidents (Community Reports).
- **Historique** : Logs des alertes et conseils.
- **Profil** : Gestion des préférences (Quiet Hours, Sensibilités).

### Security
- Validation des entrées API avec Joi.
- Linting strict (ESLint Standard) sur tout le codebase.
