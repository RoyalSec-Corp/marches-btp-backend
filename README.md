# Marchés BTP - Backend API

API REST pour la marketplace Marchés BTP connectant freelances/artisans et entreprises du secteur BTP.

## 🚀 Stack Technique

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Langage**: TypeScript 5
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Authentification**: JWT + Sessions
- **Validation**: Zod + express-validator

## 📁 Structure du Projet

```
marches-btp-backend/
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   ├── migrations/        # Migrations Prisma
│   └── seed.ts           # Données de test
├── src/
│   ├── config/           # Configuration (env, database)
│   ├── controllers/      # Contrôleurs (gestion requêtes HTTP)
│   ├── services/         # Services (logique métier)
│   ├── models/           # Types, interfaces, DTOs
│   ├── middlewares/      # Middlewares Express
│   ├── routes/           # Définition des routes API
│   ├── utils/            # Utilitaires
│   ├── types/            # Types TypeScript globaux
│   ├── app.ts            # Configuration Express
│   └── index.ts          # Point d'entrée
├── .env.example          # Variables d'environnement (template)
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/RoyalSec-Corp/marches-btp-backend.git
   cd marches-btp-backend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos valeurs
   ```

4. **Créer la base de données**
   ```bash
   npx prisma migrate dev
   ```

5. **Générer le client Prisma**
   ```bash
   npx prisma generate
   ```

6. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

## 📜 Scripts NPM

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrer en mode développement (hot reload) |
| `npm run build` | Compiler TypeScript vers JavaScript |
| `npm start` | Démarrer en production |
| `npm run prisma:migrate` | Exécuter les migrations |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:studio` | Ouvrir Prisma Studio |
| `npm run lint` | Linter le code |
| `npm test` | Lancer les tests |

## 🔗 Endpoints API

### Authentification (`/api/auth`)
- `POST /register` - Inscription
- `POST /login` - Connexion
- `POST /logout` - Déconnexion
- `POST /refresh` - Rafraîchir le token
- `POST /forgot-password` - Mot de passe oublié
- `POST /reset-password` - Réinitialiser le mot de passe

### Utilisateurs (`/api/users`)
- `GET /me` - Profil connecté
- `PUT /me` - Mettre à jour le profil

### Freelances (`/api/freelances`)
- `GET /` - Liste des freelances
- `GET /:id` - Détails d'un freelance
- `POST /` - Créer un profil
- `PUT /:id` - Mettre à jour

### Entreprises (`/api/entreprises`)
- `GET /` - Liste des entreprises
- `GET /:id` - Détails d'une entreprise
- `POST /` - Créer un profil
- `PUT /:id` - Mettre à jour

### Contrats (`/api/contrats`)
- `GET /` - Liste des contrats
- `GET /:id` - Détails d'un contrat
- `POST /` - Créer un contrat
- `PUT /:id` - Mettre à jour
- `POST /:id/sign` - Signer
- `DELETE /:id` - Annuler

### Notifications (`/api/notifications`)
- `GET /` - Liste des notifications
- `GET /unread-count` - Nombre non lues
- `PUT /:id/read` - Marquer comme lue
- `PUT /read-all` - Tout marquer comme lu

## 🔐 Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | Environnement | `development` |
| `PORT` | Port du serveur | `3002` |
| `DATABASE_URL` | URL PostgreSQL | `postgresql://...` |
| `JWT_SECRET` | Clé secrète JWT | `min 64 caractères` |
| `JWT_EXPIRES_IN` | Durée du token | `15m` |
| `CORS_ORIGIN` | Origine CORS | `http://localhost:3000` |

## 📊 Sprints de Développement

- [x] **Sprint 1** : Setup & Architecture
- [ ] **Sprint 2** : Modèles Prisma & Migrations
- [ ] **Sprint 3** : Authentification
- [ ] **Sprint 4** : Inscription Utilisateurs
- [ ] **Sprint 5** : Gestion des Contrats
- [ ] **Sprint 6** : Notifications
- [ ] **Sprint 7** : Tests & Documentation

## 👥 Équipe

**RoyalSec Corp** - Développement & Cybersécurité

## 📄 Licence

MIT
