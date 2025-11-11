# 🚀 Guide de Démarrage Rapide - TEAMMOVE

## ✅ Ce qui a été réalisé

### ✨ Fonctionnalités Implémentées

#### 🏢 Core Features
- ✅ **Site vitrine** avec présentation des fonctionnalités et plans
- ✅ **Système d'authentification** complet (inscription/connexion avec JWT)
- ✅ **Gestion d'événements** (création, modification, suppression, liste)
- ✅ **Génération automatique** de liens publics et QR codes
- ✅ **Invitations par email** via SendGrid
- ✅ **Dashboard entreprise** avec statistiques temps réel
- ✅ **Plans d'abonnement** (Découverte, Essentiel, Pro, Premium)
- ✅ **Base de données D1** avec migrations complètes
- ✅ **Système de matching** géographique (ville/zone)
- ✅ **Architecture complète** backend + frontend

#### 📧 Emails Automatiques (SendGrid)
- ✅ Email de bienvenue lors de l'inscription
- ✅ Invitations aux événements
- ✅ Notifications de réservations
- ✅ Confirmations de réservations
- ✅ Rappels d'événements

#### 🗄️ Base de Données
- ✅ 10 tables complètes avec relations
- ✅ Index pour performances optimales
- ✅ Données de test (seed)
- ✅ Migrations versionnées

### 🏗️ Architecture Technique

**Backend:**
- Hono (framework edge pour Cloudflare Workers)
- TypeScript
- Cloudflare D1 (SQLite distribué)
- SendGrid (emails)
- JWT Authentication
- Bcrypt (hashing)
- Zod (validation)
- QRCode generation

**Frontend:**
- Vanilla JavaScript (architecture SPA)
- TailwindCSS (via CDN)
- Font Awesome Icons
- Router intégré
- State management

**Infrastructure:**
- Cloudflare Workers (edge computing)
- Cloudflare D1 (base de données)
- PM2 (process management)
- Git + GitHub

---

## 🌐 URLs du Projet

### 📍 Application en Ligne (Sandbox)
**URL de visualisation :** https://3000-i94gpcjfxs2b5wv5amj9i-02b9cc79.sandbox.novita.ai

**API Health Check :** https://3000-i94gpcjfxs2b5wv5amj9i-02b9cc79.sandbox.novita.ai/api/health

### 📦 Repository GitHub
**URL GitHub :** https://github.com/LtheBest/Events

**Clone :** 
```bash
git clone https://github.com/LtheBest/Events.git
```

---

## 💻 Installation Locale

### 1️⃣ Prérequis
- Node.js 18+
- npm ou yarn
- Git

### 2️⃣ Cloner et Installer

```bash
# Cloner le repository
git clone https://github.com/LtheBest/Events.git
cd Events

# Installer les dépendances
npm install
```

### 3️⃣ Configuration

**Créer le fichier `.dev.vars` :**

```bash
# SendGrid API Key (obligatoire pour les emails)
SENDGRID_API_KEY=votre_clé_sendgrid

# JWT Secret (pour l'authentification)
JWT_SECRET=votre_secret_jwt_aleatoire_32_caracteres

# URL de l'application
APP_URL=http://localhost:3000

# Email expéditeur (doit être vérifié dans SendGrid)
SENDER_EMAIL=votre@email.com
```

**⚠️ Important :** Sans clé SendGrid, les emails ne seront pas envoyés mais l'application fonctionnera.

### 4️⃣ Base de Données

```bash
# Appliquer les migrations (créer les tables)
npm run db:migrate:local

# Insérer les données de test
npm run db:seed
```

**Données de test incluses :**
- Admin : `admin@teammove.com` / mot de passe hashé
- 3 entreprises de test
- 3 événements de test

### 5️⃣ Lancer l'Application

```bash
# Builder l'application
npm run build

# Nettoyer le port (optionnel)
npm run clean-port

# Démarrer avec PM2
pm2 start ecosystem.config.cjs

# Ou démarrer directement
npm run dev:sandbox
```

**L'application est accessible sur :** http://localhost:3000

### 6️⃣ Vérification

```bash
# Tester l'API
curl http://localhost:3000/api/health

# Réponse attendue :
# {"status":"ok","timestamp":"...","service":"TEAMMOVE API"}
```

---

## 🧪 Tester l'Application

### 1️⃣ Page d'Accueil
- Allez sur http://localhost:3000
- Explorez la page vitrine
- Consultez les plans tarifaires

### 2️⃣ Inscription
1. Cliquez sur "S'inscrire"
2. Choisissez un type d'organisme et plan
3. Remplissez le formulaire
4. Utilisez ces infos de test :
   - **Email :** test@entreprise.fr
   - **Mot de passe :** TestPass123
   - **Plan :** Découverte (activation immédiate)

### 3️⃣ Connexion
1. Cliquez sur "Se connecter"
2. Utilisez les identifiants créés
3. Accédez au dashboard

### 4️⃣ Dashboard Entreprise
- Consultez les statistiques
- Explorez les actions rapides
- Consultez le guide de démarrage

### 5️⃣ Créer un Événement
1. Dans le dashboard, cherchez "Créer un événement"
2. Remplissez le formulaire :
   - Nom : "Test Event"
   - Type : Ponctuel
   - Date : Date future
   - Lieu : Adresse complète
3. Validez
4. Un lien public et QR code seront générés

---

## 📋 Scripts Disponibles

```bash
# Développement
npm run dev                    # Vite dev server
npm run dev:sandbox            # Wrangler + D1 local (recommandé)

# Build
npm run build                  # Builder pour production

# Base de données
npm run db:migrate:local       # Appliquer migrations localement
npm run db:migrate:prod        # Appliquer migrations en production
npm run db:seed                # Insérer données de test
npm run db:reset               # Reset complet de la DB locale
npm run db:console:local       # Console SQL locale
npm run db:console:prod        # Console SQL production

# PM2
pm2 start ecosystem.config.cjs # Démarrer l'app
pm2 list                       # Lister les services
pm2 logs teammove              # Voir les logs
pm2 restart teammove           # Redémarrer
pm2 stop teammove              # Arrêter
pm2 delete teammove            # Supprimer

# Utilitaires
npm run clean-port             # Nettoyer le port 3000
npm run test                   # Tester l'API
```

---

## 🚀 Déploiement sur Cloudflare Pages

### Prérequis
- Compte Cloudflare
- Wrangler CLI configuré

### Étapes

```bash
# 1. Créer la base de données D1 de production
npx wrangler d1 create teammove-production

# 2. Copier le database_id retourné et le mettre dans wrangler.jsonc

# 3. Appliquer les migrations
npm run db:migrate:prod

# 4. Créer le projet Cloudflare Pages
npx wrangler pages project create teammove --production-branch main

# 5. Configurer les secrets
npx wrangler pages secret put SENDGRID_API_KEY --project-name teammove
npx wrangler pages secret put JWT_SECRET --project-name teammove
npx wrangler pages secret put SENDER_EMAIL --project-name teammove

# 6. Déployer
npm run deploy
```

**URLs générées :**
- Production : `https://teammove.pages.dev`
- Branch : `https://main.teammove.pages.dev`

---

## 📊 Structure de la Base de Données

### Tables Principales

1. **companies** - Entreprises inscrites
2. **events** - Événements créés
3. **event_invitations** - Invitations par email
4. **participants** - Participants aux événements (conducteurs/passagers)
5. **rides** - Trajets proposés par conducteurs
6. **bookings** - Réservations des passagers
7. **passenger_requests** - Demandes en attente de conducteurs
8. **messages** - Communication entre participants
9. **vehicles** - Véhicules d'entreprise (plans Pro/Premium)
10. **notifications** - Notifications système

### Relations

```
companies
  ├── events (1:N)
  │   ├── participants (1:N)
  │   │   ├── rides (conducteurs) (1:N)
  │   │   │   └── bookings (1:N)
  │   │   └── passenger_requests (passagers) (1:N)
  │   ├── event_invitations (1:N)
  │   └── messages (1:N)
  └── vehicles (1:N)
```

---

## 🔧 Dépannage

### Problème : Port 3000 déjà utilisé
```bash
npm run clean-port
# ou
fuser -k 3000/tcp
```

### Problème : Base de données corrompue
```bash
npm run db:reset
```

### Problème : Erreurs de build
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problème : PM2 ne démarre pas
```bash
pm2 delete all
pm2 start ecosystem.config.cjs
```

---

## 📚 API Endpoints Principaux

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Events
- `GET /api/events` - Liste des événements
- `POST /api/events` - Créer un événement
- `GET /api/events/:id` - Détails d'un événement
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement
- `GET /api/events/:id/stats` - Statistiques

### Health
- `GET /api/health` - État de l'API

---

## 📝 Notes Importantes

### ⚠️ Fonctionnalités Non Implémentées (Extensions Futures)

Les fonctionnalités suivantes sont dans le schéma de base de données mais nécessitent une implémentation frontend/backend complète :

1. **Dashboard Admin** - Interface admin pour gérer toutes les entreprises
2. **Page d'inscription événements** - Page publique complète pour rejoindre un événement
3. **Gestion complète du covoiturage** - Interface conducteur/passager avec matching en temps réel
4. **Communication bidirectionnelle** - Système de messagerie intégré
5. **Véhicules d'entreprise** - Gestion des véhicules pour plans Pro/Premium
6. **Upload de logo** - Personnalisation du logo sur dashboard
7. **Paiement Stripe** - Intégration paiement pour plan Essentiel
8. **Mode sombre** - Toggle light/dark mode
9. **Export de rapports** - Export PDF/Excel des statistiques
10. **API publique** - API REST pour intégrations tierces

### ✅ Ce qui Fonctionne Maintenant

- ✅ Site vitrine complet
- ✅ Inscription/Connexion
- ✅ Dashboard entreprise basique
- ✅ Création d'événements avec QR codes
- ✅ Invitations par email
- ✅ Statistiques temps réel
- ✅ Gestion des plans d'abonnement
- ✅ API REST complète pour événements
- ✅ Système de matching géographique (backend)

---

## 🎯 Roadmap Future

### Phase 2 (À Développer)
- [ ] Dashboard Admin complet
- [ ] Page publique inscription événements
- [ ] Interface covoiturage complète
- [ ] Système de messagerie
- [ ] Paiements Stripe
- [ ] Upload logo personnalisé
- [ ] Mode sombre
- [ ] Tests unitaires (Jest)
- [ ] Tests E2E (Playwright)

### Phase 3 (Extensions)
- [ ] Application mobile (React Native)
- [ ] Notifications push
- [ ] Intégration calendrier (Google/Outlook)
- [ ] Export rapports avancés
- [ ] Webhooks
- [ ] API publique documentée
- [ ] Multi-langue
- [ ] Marketplace de plugins

---

## 💡 Conseils de Développement

### Pour Ajouter une Nouvelle Fonctionnalité

1. **Backend** : Créer la route dans `src/api/`
2. **Types** : Ajouter les types dans `src/types/`
3. **DB** : Créer une migration si nécessaire
4. **Frontend** : Ajouter la fonctionnalité dans `public/static/app.js`
5. **Tester** : Utiliser curl ou Postman
6. **Commit** : Faire un commit descriptif

### Architecture Recommandée

- Séparer les concerns (API, lib, types)
- Utiliser Zod pour validation
- Toujours hasher les mots de passe
- Logger les erreurs importantes
- Tester les edge cases

---

## 📧 Support

Pour toute question ou problème :
- Consultez le README principal
- Vérifiez les logs : `pm2 logs teammove`
- Testez l'API health check

---

**🎉 Félicitations ! Vous avez maintenant TEAMMOVE prêt à l'emploi.**

*Développé avec ❤️ pour simplifier la gestion d'événements et le covoiturage*
