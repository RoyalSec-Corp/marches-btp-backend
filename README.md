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
│   ├── schema/                  # Schema Prisma modulaire (19 fichiers)
│   │   ├── schema.prisma        # Config (generator + datasource)
│   │   ├── enums.prisma         # Enumerations (18 enums)
│   │   │
│   │   │ # === MVP1 - Core ===
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
│   │   ├── notification.prisma  # Model Notification
│   │   │
│   │   │ # === MVP2 - Features ===
│   │   ├── referral.prisma      # Parrainage (3 models)
│   │   ├── paiement.prisma      # Paiements SG
│   │   ├── milestone.prisma     # Jalons contrat
│   │   ├── avis.prisma          # Notation
│   │   ├── favori.prisma        # Favoris
│   │   └── litige.prisma        # Litiges (3 models)
│   │
│   ├── migrations/              # Migrations Prisma
│   └── seed.ts                  # Donnees de test
├── src/
│   ├── config/           # Configuration
│   ├── controllers/      # Controleurs
│   ├── services/         # Services (logique metier)
│   ├── middlewares/      # Middlewares Express
│   ├── routes/           # Routes API
│   ├── utils/            # Utilitaires
│   └── index.ts          # Point d'entree
├── .env.example
├── package.json
└── tsconfig.json
```

## 🛠️ Installation

```bash
# 1. Cloner le repository
git clone https://github.com/RoyalSec-Corp/marches-btp-backend.git
cd marches-btp-backend

# 2. Installer les dependances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Editer .env avec vos valeurs

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
| `npm run db:setup` | Setup complet BDD |
| `npm run prisma:generate` | Generer le client Prisma |
| `npm run prisma:migrate` | Executer les migrations |
| `npm run prisma:seed` | Peupler la BDD |
| `npm run prisma:reset` | Reset complet de la BDD |
| `npm run prisma:studio` | Interface graphique BDD |

## 📊 Schema Base de Donnees

### MVP1 - Tables Core (11 models)

| Table | Description |
|-------|-------------|
| `users` | Authentification (FREELANCE, ENTREPRISE, APPEL_OFFRE, ADMIN) |
| `sessions` | Sessions JWT |
| `freelances` | Profils artisans |
| `entreprises` | Profils entreprises |
| `appels_offres` | Appels d'offres |
| `appel_offre_candidatures` | Candidatures |
| `contrats` | Contrats |
| `contract_signatures` | Signatures electroniques |
| `contract_documents` | Documents |
| `messages` | Messagerie |
| `notifications` | Alertes |

### MVP2 - Tables Features (10 models)

| Table | Description |
|-------|-------------|
| `referrals` | Parrainages |
| `referral_rewards` | Recompenses parrainage |
| `referral_settings` | Configuration parrainage |
| `paiements` | Paiements (Societe Generale) |
| `contract_milestones` | Jalons/etapes contrat |
| `avis` | Notes et commentaires |
| `favoris` | Freelances favoris |
| `litiges` | Conflits/disputes |
| `litige_messages` | Messages litige |
| `litige_documents` | Documents litige |

### Enums (18 total)

**MVP1 :**
```
UserType          : FREELANCE | ENTREPRISE | APPEL_OFFRE | ADMIN
StatutCompte      : EN_ATTENTE | VALIDE | REFUSE | SUSPENDU
ContratStatus     : BROUILLON | EN_ATTENTE | SIGNE | EN_COURS | TERMINE | ANNULE | LITIGE
AppelOffreStatus  : BROUILLON | PUBLIE | CLOTURE | ANNULE
CandidatureStatus : EN_ATTENTE | ACCEPTE | REFUSE | RETIRE
NotificationType  : CONTRAT | MESSAGE | APPEL_OFFRE | CANDIDATURE | PAIEMENT | MILESTONE | AVIS | LITIGE | REFERRAL | SYSTEME
ModeTarification  : JOUR | HEURE | FORFAIT
TypePersonne      : PARTICULIER | PROFESSIONNEL
SignerType        : FREELANCE | ENTREPRISE
TypeCandidature   : FREELANCE | ENTREPRISE
```

**MVP2 :**
```
ReferralStatus    : PENDING | VALIDATED | CANCELLED | EXPIRED
RewardType        : CASH | CREDIT | DISCOUNT | FREE_MONTH
RewardStatus      : PENDING | APPROVED | PAID | CANCELLED
PaymentStatus     : EN_ATTENTE | EN_COURS | VALIDE | ECHOUE | REMBOURSE | ANNULE
PaymentMethod     : VIREMENT | CARTE | PRELEVEMENT | CHEQUE
MilestoneStatus   : EN_ATTENTE | EN_COURS | COMPLETE | VALIDE | REFUSE | ANNULE
AvisStatus        : EN_ATTENTE | APPROUVE | REJETE | SIGNALE
LitigeType        : QUALITE_TRAVAIL | RETARD_LIVRAISON | NON_PAIEMENT | ABANDON_CHANTIER | MALFACON | NON_RESPECT_CONTRAT | COMMUNICATION | AUTRE
LitigeStatus      : OUVERT | EN_COURS | EN_ATTENTE_REPONSE | MEDIATION | RESOLU | FERME | ESCALADE
LitigePriority    : BASSE | NORMALE | HAUTE | URGENTE
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
DATABASE_URL=postgresql://marchesbtp_admin:MarchesBTP2026!@localhost:5432/marchesbtp
JWT_SECRET=RoyalSecMarchesBTP2026SuperSecretKeyForJWTTokenGeneration64CharsMin
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=RoyalSecMarchesBTPRefreshToken2026AnotherSecretKeyForRefresh64Ch
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## 📊 Sprints

- [x] **Sprint 1** : Setup & Architecture
- [x] **Sprint 2** : Schema Prisma MVP1 (11 models)
- [x] **Sprint 2.5** : Schema Prisma MVP2 (10 models supplementaires)
- [ ] **Sprint 3** : Authentification
- [ ] **Sprint 4** : Inscription Utilisateurs
- [ ] **Sprint 5** : Gestion des Contrats
- [ ] **Sprint 6** : Notifications
- [ ] **Sprint 7** : Tests & Documentation

## 📈 Statistiques

| Metrique | Valeur |
|----------|--------|
| **Models** | 21 |
| **Enums** | 18 |
| **Fichiers Schema** | 19 |
| **Tables MVP1** | 11 |
| **Tables MVP2** | 10 |

## 👥 Equipe

**RoyalSec Corp** - Developpement & Cybersecurite

## 📄 Licence

MIT
