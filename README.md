# 🚀 TEAMMOVE - Plateforme de Gestion d'Événements et Covoiturage

> Plateforme tout-en-un pour les entreprises, clubs et associations souhaitant organiser des événements avec gestion de covoiturage intégrée.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

## 📋 Table des Matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Architecture Technique](#architecture-technique)
- [Installation Locale](#installation-locale)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Plans d'Abonnement](#plans-dabonnement)
- [Déploiement](#déploiement)
- [Captures d'écran](#captures-décran)

## 🎯 À Propos

**TEAMMOVE** est une plateforme SaaS innovante qui permet aux organisations de :
- 📅 **Créer et gérer des événements** (ponctuels ou récurrents)
- 🚗 **Organiser le covoiturage** avec matching intelligent conducteurs/passagers
- 📊 **Suivre les statistiques** en temps réel
- 📧 **Communiquer** avec les participants via emails automatiques
- 🎫 **Partager** des liens et QR codes pour rejoindre les événements

## ✨ Fonctionnalités

### 🏢 Pour les Entreprises

#### ✅ Gestion d'Événements
- Création d'événements ponctuels ou récurrents
- Invitations par email multiples
- Génération automatique de liens publics et QR codes
- Modification et suppression d'événements
- Suivi en temps réel des participants

#### 🚗 Covoiturage Intelligent
- **Conducteurs** : Créer des trajets avec places disponibles
- **Passagers** : Réserver des places auprès des conducteurs
- Matching automatique par zone géographique (ville/département)
- Système de notification pour réservations
- Gestion des réservations (accepter/refuser)
- Option rémunération (0,10€/km suggéré)

#### 📊 Dashboard Entreprise
- Vue d'ensemble avec statistiques temps réel
- Compteurs : événements, conducteurs, passagers, places disponibles
- Gestion du profil d'entreprise
- Upgrade de plan d'abonnement
- Historique complet des événements

#### 💬 Communication
- Emails automatiques (bienvenue, invitations, confirmations)
- Notifications de réservations
- Communication bidirectionnelle conducteur/passager
- Rappels d'événements (24h avant)

### 👥 Pour les Participants

#### 🚗 En tant que Conducteur
- Proposer un trajet avec départ/destination
- Définir le nombre de places disponibles
- Choisir rémunération ou trajet gratuit
- Accepter/refuser les demandes de réservation
- Recevoir les coordonnées des passagers confirmés

#### 🪑 En tant que Passager
- Rechercher des trajets disponibles
- Réserver une place auprès d'un conducteur
- Système d'attente si aucun conducteur disponible
- Notifications automatiques quand un conducteur devient disponible
- Confirmation de réservation par email

### 🔐 Sécurité & Authentification
- Inscription avec validation email
- Authentification JWT
- Mots de passe hashés (bcrypt)
- Protection CORS
- Validation des données (Zod)

## 🏗️ Architecture Technique

### Stack Technologique

**Frontend**
- Vanilla JavaScript (architecture React-like)
- TailwindCSS (via CDN)
- Font Awesome Icons
- Router client-side intégré

**Backend**
- Hono (framework edge-native pour Cloudflare Workers)
- TypeScript
- Cloudflare D1 (SQLite distribué)
- Cloudflare Workers (edge computing)

**Services**
- SendGrid (emails transactionnels)
- QRCode generation
- Bcrypt (hashing mots de passe)
- Zod (validation de données)

### Base de Données (D1 - SQLite)

**Tables principales :**
- `companies` - Entreprises inscrites
- `events` - Événements créés
- `participants` - Participants aux événements
- `rides` - Trajets proposés par les conducteurs
- `bookings` - Réservations des passagers
- `passenger_requests` - Demandes en attente de conducteurs
- `messages` - Communication entre utilisateurs
- `notifications` - Notifications système
- `vehicles` - Véhicules d'entreprise (plans Pro/Premium)
- `event_invitations` - Invitations par email

## 🚀 Installation Locale

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Cloudflare (pour production)
- Compte SendGrid (pour les emails)

### Étapes d'installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/teammove.git
cd teammove

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .dev.vars.example .dev.vars
# Modifier .dev.vars avec vos clés API

# 4. Créer et initialiser la base de données D1 locale
npm run db:migrate:local
npm run db:seed

# 5. Builder l'application
npm run build

# 6. Lancer en mode développement
npm run dev:sandbox

# L'application est accessible sur http://localhost:3000
```

### Configuration des Variables d'Environnement

Créez un fichier `.dev.vars` à la racine :

```bash
# SendGrid API Key
SENDGRID_API_KEY=votre_clé_sendgrid

# JWT Secret
JWT_SECRET=votre_secret_jwt_aleatoire

# URL de l'application
APP_URL=http://localhost:3000

# Email expéditeur (vérifié dans SendGrid)
SENDER_EMAIL=votre@email.com
```

## 📖 Utilisation

### 1️⃣ Inscription d'une Entreprise

1. Allez sur la page d'accueil
2. Cliquez sur "S'inscrire"
3. Choisissez :
   - Type d'organisme (Club, PME, Grande Entreprise)
   - Plan d'abonnement (Découverte, Essentiel, Pro, Premium)
4. Remplissez le formulaire
5. Acceptez les conditions
6. Cliquez sur "Créer un compte"

**Note :** 
- Plan Découverte : activation immédiate
- Plan Essentiel : redirection vers paiement
- Plans Pro/Premium : demande envoyée à l'admin

### 2️⃣ Créer un Événement

1. Connectez-vous à votre dashboard
2. Cliquez sur "Créer un événement"
3. Remplissez :
   - Nom de l'événement
   - Type (ponctuel/récurrent)
   - Date et heure
   - Lieu (adresse complète)
   - Emails des invités (optionnel)
4. Validez

**Résultat :**
- Lien public généré : `https://votre-app.com/join/event-xyz`
- QR code téléchargeable
- Invitations envoyées par email automatiquement

### 3️⃣ Rejoindre un Événement (Participants)

**Trois façons :**
- Scanner le QR code
- Cliquer sur le lien public
- Cliquer sur "Rejoindre" dans l'email d'invitation

**Inscription :**
1. Entrez nom et prénom
2. Choisissez votre rôle :
   - **Conducteur** : proposez un trajet
   - **Passager** : recherchez un trajet
3. Remplissez les détails selon votre rôle
4. Confirmez l'inscription

### 4️⃣ Gestion du Covoiturage

**Conducteur :**
1. Créez un trajet avec départ/destination
2. Indiquez le nombre de places
3. Choisissez si rémunération souhaitée
4. Recevez les demandes de réservation par email
5. Acceptez ou refusez via les boutons dans l'email

**Passager :**
1. Entrez votre adresse de départ
2. Consultez les conducteurs disponibles
3. Réservez une place
4. Recevez la confirmation par email
5. Coordonnées du conducteur fournies si accepté

## 🔌 API Documentation

### Authentication

#### POST `/api/auth/register`
Inscription d'une nouvelle entreprise.

**Body:**
```json
{
  "name": "Mon Entreprise",
  "email": "contact@entreprise.fr",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "company_type": "pme",
  "plan": "essentiel",
  "phone": "0123456789",
  "acceptTerms": true
}
```

#### POST `/api/auth/login`
Connexion.

**Body:**
```json
{
  "email": "contact@entreprise.fr",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "company": { ... }
  }
}
```

#### GET `/api/auth/me`
Récupérer les infos de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

### Events

#### GET `/api/events`
Liste tous les événements de l'entreprise.

#### POST `/api/events`
Créer un événement.

**Body:**
```json
{
  "name": "Séminaire Annuel",
  "type": "ponctuel",
  "event_type_category": "Professionnel",
  "date": "2025-12-15",
  "time": "14:00",
  "duration": 180,
  "location": "123 Rue de Paris, 75001 Paris",
  "invited_emails": ["user1@example.com", "user2@example.com"]
}
```

#### GET `/api/events/:id`
Détails d'un événement.

#### PUT `/api/events/:id`
Modifier un événement.

#### DELETE `/api/events/:id`
Supprimer un événement.

#### GET `/api/events/:id/stats`
Statistiques d'un événement.

## 💰 Plans d'Abonnement

### 🆓 Plan Découverte (Gratuit)
- 2 événements/an
- 20 participants max
- Gestion simple
- Reporting basique

### 💎 Plan Essentiel (25,99€/mois ou 300€/an)
- 10 événements/an
- 500 participants max
- Reporting avancé
- Notifications automatiques
- Support standard
- **Messagerie de diffusion**

### 🚀 Plan Pro (Sur Devis)
- Événements illimités
- 5000 participants
- CRM intégré
- Stats avancées
- API access
- **Logo personnalisé sur dashboard**
- **Véhicules d'entreprise**

### ⭐ Plan Premium (Sur Devis)
- Événements illimités
- 10000+ participants
- Tout du plan Pro
- **Marque blanche**
- Intégrations personnalisées
- Support dédié 24/7

## 🌍 Déploiement

### Déploiement sur Cloudflare Pages

```bash
# 1. Créer la base de données D1 de production
npx wrangler d1 create teammove-production

# 2. Copier le database_id dans wrangler.jsonc

# 3. Appliquer les migrations en production
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

### URLs Générées

- **Production :** `https://teammove.pages.dev`
- **Branch main :** `https://main.teammove.pages.dev`

## 📸 Captures d'écran

### Page d'accueil
Présentation des fonctionnalités et plans tarifaires.

### Dashboard Entreprise
Vue d'ensemble avec statistiques en temps réel.

### Création d'Événement
Formulaire complet avec génération de QR code.

### Page Publique d'Inscription
Interface pour rejoindre un événement et s'inscrire au covoiturage.

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev                    # Démarrer Vite dev server
npm run dev:sandbox            # Démarrer avec Wrangler + D1 local

# Build
npm run build                  # Builder pour production

# Base de données
npm run db:migrate:local       # Appliquer migrations (local)
npm run db:migrate:prod        # Appliquer migrations (production)
npm run db:seed                # Insérer données de test
npm run db:reset               # Reset complet de la DB locale
npm run db:console:local       # Console SQL locale
npm run db:console:prod        # Console SQL production

# Déploiement
npm run deploy                 # Déployer sur Cloudflare Pages

# Utilitaires
npm run clean-port             # Nettoyer le port 3000
npm run test                   # Tester l'API
```

## 📂 Structure du Projet

```
teammove/
├── src/
│   ├── api/              # Routes API
│   │   ├── auth.ts       # Authentification
│   │   └── events.ts     # Gestion événements
│   ├── lib/              # Utilitaires
│   │   ├── db.ts         # Service base de données
│   │   ├── auth.ts       # Authentification JWT
│   │   ├── email.ts      # Service SendGrid
│   │   ├── qrcode.ts     # Génération QR codes
│   │   └── matching.ts   # Matching géographique
│   ├── types/            # Types TypeScript
│   │   └── index.ts
│   └── index.tsx         # Point d'entrée Hono
├── public/
│   └── static/
│       └── app.js        # Application frontend
├── migrations/           # Migrations SQL
│   └── 0001_initial_schema.sql
├── seed.sql              # Données de test
├── wrangler.jsonc        # Config Cloudflare
├── package.json
└── README.md
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteurs

**TEAMMOVE Team**

## 🙏 Remerciements

- Cloudflare Workers & D1
- Hono Framework
- SendGrid
- TailwindCSS
- Font Awesome

---

**📧 Contact :** support@teammove.com  
**🌐 Website :** https://teammove.pages.dev

---

*Fait avec ❤️ pour faciliter l'organisation d'événements et le covoiturage*
