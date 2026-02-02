-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('FREELANCE', 'ENTREPRISE', 'APPEL_OFFRE', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatutCompte" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "ContratStatus" AS ENUM ('BROUILLON', 'EN_ATTENTE', 'SIGNE', 'EN_COURS', 'TERMINE', 'ANNULE', 'LITIGE');

-- CreateEnum
CREATE TYPE "AppelOffreStatus" AS ENUM ('BROUILLON', 'PUBLIE', 'CLOTURE', 'ANNULE');

-- CreateEnum
CREATE TYPE "CandidatureStatus" AS ENUM ('EN_ATTENTE', 'ACCEPTE', 'REFUSE', 'RETIRE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONTRAT', 'MESSAGE', 'APPEL_OFFRE', 'CANDIDATURE', 'PAIEMENT', 'MILESTONE', 'AVIS', 'LITIGE', 'REFERRAL', 'SYSTEME');

-- CreateEnum
CREATE TYPE "ModeTarification" AS ENUM ('JOUR', 'HEURE', 'FORFAIT');

-- CreateEnum
CREATE TYPE "TypePersonne" AS ENUM ('PARTICULIER', 'PROFESSIONNEL');

-- CreateEnum
CREATE TYPE "SignerType" AS ENUM ('FREELANCE', 'ENTREPRISE');

-- CreateEnum
CREATE TYPE "TypeCandidature" AS ENUM ('FREELANCE', 'ENTREPRISE');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'VALIDATED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('CASH', 'CREDIT', 'DISCOUNT', 'FREE_MONTH');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'VALIDE', 'ECHOUE', 'REMBOURSE', 'ANNULE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('VIREMENT', 'CARTE', 'PRELEVEMENT', 'CHEQUE');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'COMPLETE', 'VALIDE', 'REFUSE', 'ANNULE');

-- CreateEnum
CREATE TYPE "AvisStatus" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REJETE', 'SIGNALE');

-- CreateEnum
CREATE TYPE "LitigeType" AS ENUM ('QUALITE_TRAVAIL', 'RETARD_LIVRAISON', 'NON_PAIEMENT', 'ABANDON_CHANTIER', 'MALFACON', 'NON_RESPECT_CONTRAT', 'COMMUNICATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "LitigeStatus" AS ENUM ('OUVERT', 'EN_COURS', 'EN_ATTENTE_REPONSE', 'MEDIATION', 'RESOLU', 'FERME', 'ESCALADE');

-- CreateEnum
CREATE TYPE "LitigePriority" AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE');

-- CreateTable
CREATE TABLE "appels_offres" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "budget" TEXT,
    "ville" TEXT,
    "type_construction" TEXT,
    "secteur" TEXT,
    "type_personne" "TypePersonne" NOT NULL DEFAULT 'PROFESSIONNEL',
    "entreprise_id" INTEGER,
    "admin_id" INTEGER,
    "url_source" TEXT,
    "cible" TEXT DEFAULT 'TOUS',
    "statut_compte" "AppelOffreStatus" NOT NULL DEFAULT 'BROUILLON',
    "date_limite" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appels_offres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" SERIAL NOT NULL,
    "contrat_id" INTEGER NOT NULL,
    "auteur_id" INTEGER NOT NULL,
    "auteur_type" TEXT NOT NULL,
    "cible_id" INTEGER NOT NULL,
    "cible_type" TEXT NOT NULL,
    "note_globale" DOUBLE PRECISION NOT NULL,
    "note_qualite" DOUBLE PRECISION,
    "note_delais" DOUBLE PRECISION,
    "note_communication" DOUBLE PRECISION,
    "note_prix" DOUBLE PRECISION,
    "titre" TEXT,
    "commentaire" TEXT,
    "reponse" TEXT,
    "reponse_at" TIMESTAMP(3),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "moderation_status" "AvisStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "moderated_by" INTEGER,
    "moderated_at" TIMESTAMP(3),
    "moderation_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appel_offre_candidatures" (
    "id" SERIAL NOT NULL,
    "appel_offre_id" INTEGER NOT NULL,
    "freelance_id" INTEGER,
    "entreprise_id" INTEGER,
    "type_candidat" "TypeCandidature" NOT NULL,
    "proposition" TEXT,
    "budget_propose" DOUBLE PRECISION,
    "duree_proposee" TEXT,
    "statut" "CandidatureStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_postulation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appel_offre_candidatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "montant" DOUBLE PRECISION NOT NULL,
    "statut" "ContratStatus" NOT NULL DEFAULT 'BROUILLON',
    "progress_stage" TEXT,
    "both_parties_signed" BOOLEAN NOT NULL DEFAULT false,
    "signature_completed_at" TIMESTAMP(3),
    "entreprise_id" INTEGER NOT NULL,
    "freelance_id" INTEGER NOT NULL,
    "appel_offre_id" INTEGER,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_documents" (
    "id" SERIAL NOT NULL,
    "contrat_id" INTEGER NOT NULL,
    "document_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "is_signed" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entreprises" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "raison_sociale" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "forme_juridique" TEXT,
    "naf_code" TEXT,
    "representant_legal" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "code_postal" TEXT,
    "kbis_path" TEXT,
    "description" TEXT,
    "statut_compte" "StatutCompte" NOT NULL DEFAULT 'EN_ATTENTE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entreprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoris" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_type" TEXT NOT NULL,
    "freelance_id" INTEGER NOT NULL,
    "note" TEXT,
    "tags" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoris_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelances" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "metier" TEXT NOT NULL,
    "tarif" DOUBLE PRECISION NOT NULL,
    "mode_tarification" "ModeTarification" NOT NULL DEFAULT 'JOUR',
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "experience_years" INTEGER,
    "description" TEXT,
    "siret" TEXT,
    "kbis_path" TEXT,
    "assurance_path" TEXT,
    "photo_profil" TEXT,
    "statut_compte" "StatutCompte" NOT NULL DEFAULT 'EN_ATTENTE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "note_globale" DOUBLE PRECISION,
    "nombre_avis" INTEGER NOT NULL DEFAULT 0,
    "nombre_contrats" INTEGER NOT NULL DEFAULT 0,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "freelances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litiges" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "contrat_id" INTEGER NOT NULL,
    "demandeur_id" INTEGER NOT NULL,
    "demandeur_type" TEXT NOT NULL,
    "defendeur_id" INTEGER NOT NULL,
    "defendeur_type" TEXT NOT NULL,
    "type" "LitigeType" NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "montant_litige" DOUBLE PRECISION,
    "statut" "LitigeStatus" NOT NULL DEFAULT 'OUVERT',
    "priorite" "LitigePriority" NOT NULL DEFAULT 'NORMALE',
    "resolution" TEXT,
    "montant_accorde" DOUBLE PRECISION,
    "resolved_by" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "assigned_to" INTEGER,
    "assigned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "litiges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litige_messages" (
    "id" SERIAL NOT NULL,
    "litige_id" INTEGER NOT NULL,
    "auteur_id" INTEGER NOT NULL,
    "auteur_type" TEXT NOT NULL,
    "auteur_nom" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "litige_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litige_documents" (
    "id" SERIAL NOT NULL,
    "litige_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "litige_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "sender_type" TEXT NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "receiver_type" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "contrat_id" INTEGER,
    "appel_offre_id" INTEGER,
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_milestones" (
    "id" SERIAL NOT NULL,
    "contrat_id" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 1,
    "montant" DOUBLE PRECISION NOT NULL,
    "pourcentage" DOUBLE PRECISION,
    "date_echeance" TIMESTAMP(3),
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "statut" "MilestoneStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "valide_par" INTEGER,
    "valide_at" TIMESTAMP(3),
    "commentaire" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "destinataire_id" INTEGER NOT NULL,
    "destinataire_type" TEXT NOT NULL,
    "type_notification" "NotificationType" NOT NULL,
    "titre" TEXT,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "contrat_id" INTEGER,
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "contrat_id" INTEGER NOT NULL,
    "milestone_id" INTEGER,
    "montant" DOUBLE PRECISION NOT NULL,
    "montant_ht" DOUBLE PRECISION,
    "montant_tva" DOUBLE PRECISION,
    "devise" TEXT NOT NULL DEFAULT 'EUR',
    "payeur_id" INTEGER NOT NULL,
    "payeur_type" TEXT NOT NULL,
    "beneficiaire_id" INTEGER NOT NULL,
    "beneficiaire_type" TEXT NOT NULL,
    "methode_paiement" "PaymentMethod" NOT NULL,
    "statut" "PaymentStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "sg_transaction_id" TEXT,
    "sg_status" TEXT,
    "sg_response_data" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_paiement" TIMESTAMP(3),
    "date_echeance" TIMESTAMP(3),
    "facture_url" TEXT,
    "facture_number" TEXT,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "referrer_id" INTEGER NOT NULL,
    "referrer_type" TEXT NOT NULL,
    "referred_id" INTEGER NOT NULL,
    "referred_type" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated_at" TIMESTAMP(3),

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_rewards" (
    "id" SERIAL NOT NULL,
    "referral_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_type" TEXT NOT NULL,
    "reward_type" "RewardType" NOT NULL,
    "amount" DOUBLE PRECISION,
    "description" TEXT,
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_settings" (
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "referrer_reward_amount" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "referred_reward_amount" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "min_contracts_to_validate" INTEGER NOT NULL DEFAULT 1,
    "reward_expiration_days" INTEGER NOT NULL DEFAULT 90,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_signatures" (
    "id" SERIAL NOT NULL,
    "contrat_id" INTEGER NOT NULL,
    "signer_id" INTEGER NOT NULL,
    "signer_type" "SignerType" NOT NULL,
    "signer_name" TEXT NOT NULL,
    "signature_data" TEXT,
    "ip_address" TEXT,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "nom" TEXT,
    "prenom" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "code_postal" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "referral_code" TEXT,
    "referred_by_user_id" INTEGER,
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appels_offres_entreprise_id_idx" ON "appels_offres"("entreprise_id");

-- CreateIndex
CREATE INDEX "appels_offres_statut_compte_idx" ON "appels_offres"("statut_compte");

-- CreateIndex
CREATE INDEX "appels_offres_ville_idx" ON "appels_offres"("ville");

-- CreateIndex
CREATE INDEX "appels_offres_secteur_idx" ON "appels_offres"("secteur");

-- CreateIndex
CREATE INDEX "appels_offres_date_limite_idx" ON "appels_offres"("date_limite");

-- CreateIndex
CREATE INDEX "avis_contrat_id_idx" ON "avis"("contrat_id");

-- CreateIndex
CREATE INDEX "avis_auteur_id_idx" ON "avis"("auteur_id");

-- CreateIndex
CREATE INDEX "avis_cible_id_idx" ON "avis"("cible_id");

-- CreateIndex
CREATE INDEX "avis_note_globale_idx" ON "avis"("note_globale");

-- CreateIndex
CREATE INDEX "avis_moderation_status_idx" ON "avis"("moderation_status");

-- CreateIndex
CREATE INDEX "avis_is_public_idx" ON "avis"("is_public");

-- CreateIndex
CREATE UNIQUE INDEX "avis_contrat_id_auteur_id_key" ON "avis"("contrat_id", "auteur_id");

-- CreateIndex
CREATE INDEX "appel_offre_candidatures_appel_offre_id_idx" ON "appel_offre_candidatures"("appel_offre_id");

-- CreateIndex
CREATE INDEX "appel_offre_candidatures_freelance_id_idx" ON "appel_offre_candidatures"("freelance_id");

-- CreateIndex
CREATE INDEX "appel_offre_candidatures_entreprise_id_idx" ON "appel_offre_candidatures"("entreprise_id");

-- CreateIndex
CREATE INDEX "appel_offre_candidatures_statut_idx" ON "appel_offre_candidatures"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "appel_offre_candidatures_appel_offre_id_freelance_id_key" ON "appel_offre_candidatures"("appel_offre_id", "freelance_id");

-- CreateIndex
CREATE UNIQUE INDEX "appel_offre_candidatures_appel_offre_id_entreprise_id_key" ON "appel_offre_candidatures"("appel_offre_id", "entreprise_id");

-- CreateIndex
CREATE INDEX "contrats_entreprise_id_idx" ON "contrats"("entreprise_id");

-- CreateIndex
CREATE INDEX "contrats_freelance_id_idx" ON "contrats"("freelance_id");

-- CreateIndex
CREATE INDEX "contrats_appel_offre_id_idx" ON "contrats"("appel_offre_id");

-- CreateIndex
CREATE INDEX "contrats_statut_idx" ON "contrats"("statut");

-- CreateIndex
CREATE INDEX "contrats_created_at_idx" ON "contrats"("created_at");

-- CreateIndex
CREATE INDEX "contract_documents_contrat_id_idx" ON "contract_documents"("contrat_id");

-- CreateIndex
CREATE UNIQUE INDEX "entreprises_user_id_key" ON "entreprises"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "entreprises_siret_key" ON "entreprises"("siret");

-- CreateIndex
CREATE INDEX "entreprises_siret_idx" ON "entreprises"("siret");

-- CreateIndex
CREATE INDEX "entreprises_statut_compte_idx" ON "entreprises"("statut_compte");

-- CreateIndex
CREATE INDEX "entreprises_naf_code_idx" ON "entreprises"("naf_code");

-- CreateIndex
CREATE INDEX "favoris_user_id_idx" ON "favoris"("user_id");

-- CreateIndex
CREATE INDEX "favoris_freelance_id_idx" ON "favoris"("freelance_id");

-- CreateIndex
CREATE UNIQUE INDEX "favoris_user_id_freelance_id_key" ON "favoris"("user_id", "freelance_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelances_user_id_key" ON "freelances"("user_id");

-- CreateIndex
CREATE INDEX "freelances_metier_idx" ON "freelances"("metier");

-- CreateIndex
CREATE INDEX "freelances_statut_compte_idx" ON "freelances"("statut_compte");

-- CreateIndex
CREATE INDEX "freelances_disponible_idx" ON "freelances"("disponible");

-- CreateIndex
CREATE INDEX "freelances_siret_idx" ON "freelances"("siret");

-- CreateIndex
CREATE INDEX "freelances_note_globale_idx" ON "freelances"("note_globale");

-- CreateIndex
CREATE UNIQUE INDEX "litiges_reference_key" ON "litiges"("reference");

-- CreateIndex
CREATE INDEX "litiges_contrat_id_idx" ON "litiges"("contrat_id");

-- CreateIndex
CREATE INDEX "litiges_demandeur_id_idx" ON "litiges"("demandeur_id");

-- CreateIndex
CREATE INDEX "litiges_defendeur_id_idx" ON "litiges"("defendeur_id");

-- CreateIndex
CREATE INDEX "litiges_statut_idx" ON "litiges"("statut");

-- CreateIndex
CREATE INDEX "litiges_priorite_idx" ON "litiges"("priorite");

-- CreateIndex
CREATE INDEX "litiges_assigned_to_idx" ON "litiges"("assigned_to");

-- CreateIndex
CREATE INDEX "litiges_created_at_idx" ON "litiges"("created_at");

-- CreateIndex
CREATE INDEX "litige_messages_litige_id_idx" ON "litige_messages"("litige_id");

-- CreateIndex
CREATE INDEX "litige_messages_auteur_id_idx" ON "litige_messages"("auteur_id");

-- CreateIndex
CREATE INDEX "litige_messages_created_at_idx" ON "litige_messages"("created_at");

-- CreateIndex
CREATE INDEX "litige_documents_litige_id_idx" ON "litige_documents"("litige_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_receiver_id_idx" ON "messages"("receiver_id");

-- CreateIndex
CREATE INDEX "messages_contrat_id_idx" ON "messages"("contrat_id");

-- CreateIndex
CREATE INDEX "messages_appel_offre_id_idx" ON "messages"("appel_offre_id");

-- CreateIndex
CREATE INDEX "messages_lu_idx" ON "messages"("lu");

-- CreateIndex
CREATE INDEX "messages_date_envoi_idx" ON "messages"("date_envoi");

-- CreateIndex
CREATE INDEX "contract_milestones_contrat_id_idx" ON "contract_milestones"("contrat_id");

-- CreateIndex
CREATE INDEX "contract_milestones_statut_idx" ON "contract_milestones"("statut");

-- CreateIndex
CREATE INDEX "contract_milestones_date_echeance_idx" ON "contract_milestones"("date_echeance");

-- CreateIndex
CREATE UNIQUE INDEX "contract_milestones_contrat_id_ordre_key" ON "contract_milestones"("contrat_id", "ordre");

-- CreateIndex
CREATE INDEX "notifications_destinataire_id_idx" ON "notifications"("destinataire_id");

-- CreateIndex
CREATE INDEX "notifications_type_notification_idx" ON "notifications"("type_notification");

-- CreateIndex
CREATE INDEX "notifications_lu_idx" ON "notifications"("lu");

-- CreateIndex
CREATE INDEX "notifications_date_envoi_idx" ON "notifications"("date_envoi");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_reference_key" ON "paiements"("reference");

-- CreateIndex
CREATE INDEX "paiements_contrat_id_idx" ON "paiements"("contrat_id");

-- CreateIndex
CREATE INDEX "paiements_milestone_id_idx" ON "paiements"("milestone_id");

-- CreateIndex
CREATE INDEX "paiements_payeur_id_idx" ON "paiements"("payeur_id");

-- CreateIndex
CREATE INDEX "paiements_beneficiaire_id_idx" ON "paiements"("beneficiaire_id");

-- CreateIndex
CREATE INDEX "paiements_statut_idx" ON "paiements"("statut");

-- CreateIndex
CREATE INDEX "paiements_reference_idx" ON "paiements"("reference");

-- CreateIndex
CREATE INDEX "paiements_date_creation_idx" ON "paiements"("date_creation");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE INDEX "referrals_referred_id_idx" ON "referrals"("referred_id");

-- CreateIndex
CREATE INDEX "referrals_referral_code_idx" ON "referrals"("referral_code");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referrer_id_referred_id_key" ON "referrals"("referrer_id", "referred_id");

-- CreateIndex
CREATE INDEX "referral_rewards_referral_id_idx" ON "referral_rewards"("referral_id");

-- CreateIndex
CREATE INDEX "referral_rewards_user_id_idx" ON "referral_rewards"("user_id");

-- CreateIndex
CREATE INDEX "referral_rewards_status_idx" ON "referral_rewards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_refresh_token_idx" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "contract_signatures_contrat_id_idx" ON "contract_signatures"("contrat_id");

-- CreateIndex
CREATE INDEX "contract_signatures_signer_id_idx" ON "contract_signatures"("signer_id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_signatures_contrat_id_signer_type_key" ON "contract_signatures"("contrat_id", "signer_type");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "users_referral_code_idx" ON "users"("referral_code");

-- AddForeignKey
ALTER TABLE "appels_offres" ADD CONSTRAINT "appels_offres_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "entreprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appel_offre_candidatures" ADD CONSTRAINT "appel_offre_candidatures_appel_offre_id_fkey" FOREIGN KEY ("appel_offre_id") REFERENCES "appels_offres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appel_offre_candidatures" ADD CONSTRAINT "appel_offre_candidatures_freelance_id_fkey" FOREIGN KEY ("freelance_id") REFERENCES "freelances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appel_offre_candidatures" ADD CONSTRAINT "appel_offre_candidatures_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "entreprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_freelance_id_fkey" FOREIGN KEY ("freelance_id") REFERENCES "freelances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_appel_offre_id_fkey" FOREIGN KEY ("appel_offre_id") REFERENCES "appels_offres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_documents" ADD CONSTRAINT "contract_documents_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_freelance_id_fkey" FOREIGN KEY ("freelance_id") REFERENCES "freelances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelances" ADD CONSTRAINT "freelances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "litiges" ADD CONSTRAINT "litiges_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "litige_messages" ADD CONSTRAINT "litige_messages_litige_id_fkey" FOREIGN KEY ("litige_id") REFERENCES "litiges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "litige_documents" ADD CONSTRAINT "litige_documents_litige_id_fkey" FOREIGN KEY ("litige_id") REFERENCES "litiges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_appel_offre_id_fkey" FOREIGN KEY ("appel_offre_id") REFERENCES "appels_offres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_milestones" ADD CONSTRAINT "contract_milestones_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_destinataire_id_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "contract_milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_freelance_fkey" FOREIGN KEY ("signer_id") REFERENCES "freelances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_entreprise_fkey" FOREIGN KEY ("signer_id") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_user_id_fkey" FOREIGN KEY ("referred_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
