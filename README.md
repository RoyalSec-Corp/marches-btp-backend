# Marches BTP - Backend API

API REST pour la marketplace Marches BTP connectant freelances/artisans et entreprises du secteur BTP.

## 🚀 Stack Technique

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Langage**: TypeScript 5
- **ORM**: Prisma (multi-file schema)
- **Base de donnees**: PostgreSQL
- **Authentification**: JWT + Sessions
- **Validation**: Zod + express-validator

## 📁 Structure du Projet

```
marches-btp-backend/
├── prisma/
│   ├── schema/                  # Schema Prisma modulaire
│   │   ├── schema.prisma        # Config (generator + datasource)
│   │   ├── enums.prisma         # Enumerations (10 enums)
│   │   ├── user.prisma          # Model User
│   │   ├── session.prisma       # Model Session
│   │   ├── freelance.prisma     # Model Freelance
│   │   ├── entreprise.prisma    # Model Entreprise
│   │   ├── appel-offre.prisma   # Model AppelOffre
│   │   ├── candidature.prisma   # Model AppelOffreCandidature
│   │   ├── contrat.prisma       # Model Contrat
│   │   ├── signature.prisma     # Model ContractSignature
│   │   ├── document.prisma      # Model ContractDocument
│   │   ├── message.prisma       # Model Message
│   │   └── notification.prisma  # Model Notification
│   ├── migrations/              # Migrations Prisma
│   └── seed.ts                  # Donnees de test
├── src/
│   ├── config/           # Configuration (env, database)
│   ├── controllers/      # Controleurs
│   ├── services/         # Services (logique metier)
│   ├── models/           # Types, interfaces, DTOs
│   ├── middlewares/      # Middlewares Express
│   ├── routes/           # Routes API
│   ├── utils/            # Utilitaires
│   ├── types/            # Types TypeScript
│   ├── app.ts            # Configuration Express
│   └── index.ts          # Point d'entree
├── .env.example
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

```bash
# 1. Cloner le repository
git clone https://github.com/RoyalSec-Corp/marches-btp-backend.git
cd marches-btp-backend

# 2. Installer les dependances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Editer .env avec vos valeurs (DATABASE_URL, JWT_SECRET, etc.)

# 4. Setup complet de la BDD
npm run db:setup

# 5. Lancer le serveur
npm run dev
```

## 📜 Scripts NPM

| Script | Description |
|--------|-------------|
| `npm run dev` | Demarrer en mode developpement |
| `npm run build` | Compiler TypeScript |
| `npm start` | Demarrer en production |
| `npm run db:setup` | Setup complet BDD (generate + migrate + seed) |
| `npm run prisma:generate` | Generer le client Prisma |
| `npm run prisma:migrate` | Executer les migrations |
| `npm run prisma:seed` | Peupler la BDD |
| `npm run prisma:reset` | Reset complet de la BDD |
| `npm run prisma:studio` | Interface graphique BDD |
| `npm run lint` | Linter le code |

## 📊 Schema Base de Donnees

### Architecture Modulaire (13 fichiers)

```
prisma/schema/
├── schema.prisma        # Configuration Prisma
├── enums.prisma         # 10 enumerations
├── user.prisma          # Authentification
├── session.prisma       # Sessions JWT
├── freelance.prisma     # Profils artisans
├── entreprise.prisma    # Profils entreprises
├── appel-offre.prisma   # Appels d'offres
├── candidature.prisma   # Candidatures AO
├── contrat.prisma       # Contrats
├── signature.prisma     # Signatures electroniques
├── document.prisma      # Documents contrat
├── message.prisma       # Messagerie
└── notification.prisma  # Alertes
```

### Tables (11 modeles)

| Table | Description |
|-------|-------------|
| `users` | Authentification (4 types: FREELANCE, ENTREPRISE, APPEL_OFFRE, ADMIN) |
| `sessions` | Sessions JWT |
| `freelances` | Profils artisans |
| `entreprises` | Profils entreprises |
| `appels_offres` | Appels d'offres |
| `appel_offre_candidatures` | Candidatures |
| `contrats` | Contrats |
| `contract_signatures` | Signatures |
| `contract_documents` | Documents |
| `messages` | Messagerie |
| `notifications` | Alertes |

### Enums (10)

```
UserType          : FREELANCE | ENTREPRISE | APPEL_OFFRE | ADMIN
StatutCompte      : EN_ATTENTE | VALIDE | REFUSE | SUSPENDU
ContratStatus     : BROUILLON | EN_ATTENTE | SIGNE | EN_COURS | TERMINE | ANNULE | LITIGE
AppelOffreStatus  : BROUILLON | PUBLIE | CLOTURE | ANNULE
CandidatureStatus : EN_ATTENTE | ACCEPTE | REFUSE | RETIRE
NotificationType  : CONTRAT | MESSAGE | APPEL_OFFRE | CANDIDATURE | SYSTEME
ModeTarification  : JOUR | HEURE | FORFAIT
TypePersonne      : PARTICULIER | PROFESSIONNEL
SignerType        : FREELANCE | ENTREPRISE
TypeCandidature   : FREELANCE | ENTREPRISE
```

## 🔐 Comptes de Test

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marchesbtp.fr | Password123! |
| Freelance | jean.dupont@email.com | Password123! |
| Freelance | marie.martin@email.com | Password123! |
| Entreprise | contact@btpconstruction.fr | Password123! |
| Entreprise | direction@renovexpert.fr | Password123! |

## 🔐 Variables d'Environnement

```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://user:password@localhost:5432/marchesbtp
JWT_SECRET=your-super-secret-key-min-64-characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## 📊 Sprints

- [x] **Sprint 1** : Setup & Architecture
- [x] **Sprint 2** : Schema Prisma modulaire (11 modeles, 10 enums)
- [ ] **Sprint 3** : Authentification
- [ ] **Sprint 4** : Inscription Utilisateurs
- [ ] **Sprint 5** : Gestion des Contrats
- [ ] **Sprint 6** : Notifications
- [ ] **Sprint 7** : Tests & Documentation

## 👥 Equipe

**RoyalSec Corp** - Developpement & Cybersecurite

## 📄 Licence

MIT
