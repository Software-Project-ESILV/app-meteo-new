
# Quality Assurance Checklist

## ✅ Backend Smoke Test
- [ ] **Startup** : `npm run dev` démarre sans erreur (Port 3000).
- [ ] **DB Connection** : MongoDB se connecte correctement ("MongoDB Connected").
- [ ] **Health Check** : `GET /health` répond 200 OK.
- [ ] **Profile Upsert** : `PUT /api/profiles/:id` crée bien un user s'il n'existe pas.
- [ ] **Validation** : Tenter de créer une règle sans `userId` renvoie 400 Bad Request.

## ✅ Frontend Smoke Test
- [ ] **Startup** : `npm run dev` démarre (Port 5173).
- [ ] **Navigation** : Les liens Home / Reports / History / Settings fonctionnent.
- [ ] **Advice Display** : La page d'accueil affiche "Chargement..." puis des conseils (ou "Aucun conseil").
- [ ] **Settings Form** :
    - [ ] Modifier un seuil (ex: Froid).
    - [ ] Sauvegarder -> Toast/Alert de succès.
    - [ ] Rafraîchir -> La valeur est persistée.
- [ ] **Locations** : Ajouter ville "Paris" -> Apparaît dans la liste -> Bouton Delete fonctionne.

## 🧪 Logic Verification
- [ ] **Quiet Hours** :
    - [ ] Configurer Start=22:00 / End=07:00.
    - [ ] Si testé à 23:00 -> Alertes bloquées.
    - [ ] Si testé à 14:00 -> Alertes passent.
- [ ] **Sensitivities** :
    - [ ] Activer "Sensible au froid".
    - [ ] Vérifier que le conseil "Cold" apparaît plus facilement (Seuil + 3°C).
- [ ] **Deduplication** :
    - [ ] Rafraîchir Advice 2 fois de suite -> Pas de doublon dans l'historique (vérifier page History).

## 🔒 Security & Robustness
- [ ] **Env Vars** : `.env` n'est pas commité (vérifier .gitignore).
- [ ] **Inputs** : Les champs numériques (lat/lon/thresholds) sont validés par Joi. (Backend reject strings/invalid numbers).
- [ ] **Crash** : Couper Mongo -> L'API doit retourner 500 proprement sans crasher process Node (via `errorHandler`).
