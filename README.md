# Marches BTP - Backend API

API REST pour la marketplace Marches BTP connectant freelances/artisans et entreprises du secteur BTP.

## 🚀 Stack Technique

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Langage**: TypeScript 5
- **ORM**: Prisma (avec prismaSchemaFolder)
- **Base de donnees**: PostgreSQL
- **Authentification**: JWT + Sessions
- **Validation**: Zod + express-validator

## 📁 Structure du Projet

```
marches-btp-backend/
├── prisma/
│   ├── schema/                    # Schema Prisma modulaire (13 fichiers)
│   │   ├── 01_base.prisma         # Generator + Datasource
│   │   ├── 02_enums.prisma        # Toutes les enumerations
│   │   ├── 03_user.prisma         # Model User
│   │   ├── 04_session.prisma      # Model Session
│   │   ├── 05_freelance.prisma    # Model Freelance
│   │   ├── 06_entreprise.prisma   # Model Entreprise
│   │   ├── 07_appel_offre.prisma  # Model AppelOffre
│   │   ├── 08_candidature.prisma  # Model AppelOffreCandidature
│   │   ├── 09_contrat.prisma      # Model Contrat
│   │   ├── 10_signature.prisma    # Model ContractSignature
│   │   ├── 11_document.prisma     # Model ContractDocument
│   │   ├── 12_message.prisma      # Model Message
│   │   └── 13_notification.prisma # Model Notification
│   ├── migrations/                # Migrations Prisma
│   └── seed.ts                    # Donnees de test
├── src/
│   ├── config/           # Configuration (env, database)
│   ├── controllers/      # Controleurs (gestion requetes HTTP)
│   ├── services/         # Services (logique metier)
│   ├── models/           # Types, interfaces, DTOs
│   ├── middlewares/      # Middlewares Express
│   ├── routes/           # Definition des routes API
│   ├── utils/            # Utilitaires
│   ├── types/            # Types TypeScript globaux
│   ├── app.ts            # Configuration Express
│   └── index.ts          # Point d'entree
├── .env.example          # Variables d'environnement (template)
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

### Prerequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Etapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/RoyalSec-Corp/marches-btp-backend.git
   cd marches-btp-backend
   ```

2. **Installer les dependances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Editer .env avec vos valeurs
   ```

4. **Setup complet de la BDD (recommande)**
   ```bash
   npm run db:setup
   ```
   Cette commande execute: generate + migrate + seed

   **OU manuellement:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

5. **Lancer le serveur de developpement**
   ```bash
   npm run dev
   ```

## 📜 Scripts NPM

| Script | Description |
|--------|-------------|
| `npm run dev` | Demarrer en mode developpement (hot reload) |
| `npm run build` | Compiler TypeScript vers JavaScript |
| `npm start` | Demarrer en production |
| `npm run db:setup` | Setup complet BDD (generate + migrate + seed) |
| `npm run prisma:migrate` | Executer les migrations |
| `npm run prisma:generate` | Generer le client Prisma |
| `npm run prisma:seed` | Peupler la BDD avec donnees de test |
| `npm run prisma:reset` | Reset complet de la BDD |
| `npm run prisma:studio` | Ouvrir Prisma Studio |
| `npm run lint` | Linter le code |
| `npm test` | Lancer les tests |

## 📊 Schema Base de Donnees (Sprint 2)

### Architecture Modulaire Prisma

Le schema est organise en **13 fichiers separes** dans `prisma/schema/` pour une meilleure maintenabilite:

| Fichier | Contenu |
|---------|---------|
| `01_base.prisma` | Configuration generator et datasource |
| `02_enums.prisma` | 10 enumerations (UserType, ContratStatus, etc.) |
| `03_user.prisma` | Model User (authentification) |
| `04_session.prisma` | Model Session (JWT) |
| `05_freelance.prisma` | Model Freelance (profil artisan) |
| `06_entreprise.prisma` | Model Entreprise (profil entreprise) |
| `07_appel_offre.prisma` | Model AppelOffre |
| `08_candidature.prisma` | Model AppelOffreCandidature |
| `09_contrat.prisma` | Model Contrat |
| `10_signature.prisma` | Model ContractSignature |
| `11_document.prisma` | Model ContractDocument |
| `12_message.prisma` | Model Message |
| `13_notification.prisma` | Model Notification |

### Tables MVP 1 (11 modeles)

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs (auth) - 4 types: FREELANCE, ENTREPRISE, APPEL_OFFRE, ADMIN |
| `sessions` | Sessions JWT |
| `freelances` | Profils artisans |
| `entreprises` | Profils entreprises |
| `appels_offres` | Publications appels d'offres |
| `appel_offre_candidatures` | Candidatures aux AO |
| `contrats` | Contrats |
| `contract_signatures` | Signatures electroniques |
| `contract_documents` | Documents attaches |
| `messages` | Messagerie |
| `notifications` | Alertes systeme |

### Enums (10)

```
UserType: FREELANCE | ENTREPRISE | APPEL_OFFRE | ADMIN
StatutCompte: EN_ATTENTE | VALIDE | REFUSE | SUSPENDU
ContratStatus: BROUILLON | EN_ATTENTE | SIGNE | EN_COURS | TERMINE | ANNULE | LITIGE
AppelOffreStatus: BROUILLON | PUBLIE | CLOTURE | ANNULE
CandidatureStatus: EN_ATTENTE | ACCEPTE | REFUSE | RETIRE
NotificationType: CONTRAT | MESSAGE | APPEL_OFFRE | CANDIDATURE | SYSTEME
ModeTarification: JOUR | HEURE | FORFAIT
TypePersonne: PARTICULIER | PROFESSIONNEL
SignerType: FREELANCE | ENTREPRISE
TypeCandidature: FREELANCE | ENTREPRISE
```

## 🔐 Comptes de Test (apres seed)

| Role | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@marchesbtp.fr | Password123! |
| Freelance | jean.dupont@email.com | Password123! |
| Freelance | marie.martin@email.com | Password123! |
| Entreprise | contact@btpconstruction.fr | Password123! |
| Entreprise | direction@renovexpert.fr | Password123! |

## 🔗 Endpoints API (a venir Sprint 3-6)

### Authentification (`/api/auth`)
- `POST /register` - Inscription
- `POST /login` - Connexion
- `POST /logout` - Deconnexion
- `POST /refresh` - Rafraichir le token
- `POST /forgot-password` - Mot de passe oublie
- `POST /reset-password` - Reinitialiser le mot de passe

### Utilisateurs (`/api/users`)
- `GET /me` - Profil connecte
- `PUT /me` - Mettre a jour le profil

### Freelances (`/api/freelances`)
- `GET /` - Liste des freelances
- `GET /:id` - Details d'un freelance
- `POST /` - Creer un profil
- `PUT /:id` - Mettre a jour

### Entreprises (`/api/entreprises`)
- `GET /` - Liste des entreprises
- `GET /:id` - Details d'une entreprise
- `POST /` - Creer un profil
- `PUT /:id` - Mettre a jour

### Appels d'Offres (`/api/appels-offres`)
- `GET /` - Liste des AO
- `GET /:id` - Details d'un AO
- `POST /` - Publier un AO
- `PUT /:id` - Mettre a jour
- `POST /:id/candidater` - Postuler

### Contrats (`/api/contrats`)
- `GET /` - Liste des contrats
- `GET /:id` - Details d'un contrat
- `POST /` - Creer un contrat
- `PUT /:id` - Mettre a jour
- `POST /:id/sign` - Signer
- `DELETE /:id` - Annuler

### Messages (`/api/messages`)
- `GET /conversations` - Liste des conversations
- `GET /conversations/:id` - Messages d'une conversation
- `POST /` - Envoyer un message

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
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@localhost:5432/marchesbtp` |
| `JWT_SECRET` | Cle secrete JWT | `min 64 caracteres` |
| `JWT_EXPIRES_IN` | Duree du token | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Duree refresh token | `7d` |
| `CORS_ORIGIN` | Origine CORS | `http://localhost:3000` |

## 📊 Sprints de Developpement

- [x] **Sprint 1** : Setup & Architecture
- [x] **Sprint 2** : Modeles Prisma & Migrations (11 modeles, 10 enums, schema modulaire)
- [ ] **Sprint 3** : Authentification
- [ ] **Sprint 4** : Inscription Utilisateurs
- [ ] **Sprint 5** : Gestion des Contrats
- [ ] **Sprint 6** : Notifications
- [ ] **Sprint 7** : Tests & Documentation

## 👥 Equipe

**RoyalSec Corp** - Developpement & Cybersecurite

## 📄 Licence

MIT
