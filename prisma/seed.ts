// ============================================
// MarchesBTP - Seed de Donnees de Test
// Sprint 2 : Donnees initiales
// ============================================

import {
  PrismaClient,
  UserType,
  StatutCompte,
  ContratStatus,
  AppelOffreStatus,
  CandidatureStatus,
  NotificationType,
  ModeTarification,
  TypePersonne,
  SignerType,
  TypeCandidature,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Debut du seed de la base de donnees...');

  // ============================================
  // 1. NETTOYAGE (optionnel en dev)
  // ============================================
  console.log('🧹 Nettoyage des donnees existantes...');

  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.contractDocument.deleteMany();
  await prisma.contractSignature.deleteMany();
  await prisma.contrat.deleteMany();
  await prisma.appelOffreCandidature.deleteMany();
  await prisma.appelOffre.deleteMany();
  await prisma.freelance.deleteMany();
  await prisma.entreprise.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // 2. CREATION DES UTILISATEURS
  // ============================================
  console.log('👤 Creation des utilisateurs...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@marchesbtp.fr',
      password: passwordHash,
      userType: UserType.ADMIN,
      nom: 'Admin',
      prenom: 'MarchesBTP',
      telephone: '0100000000',
      ville: 'Paris',
      codePostal: '75001',
      referralCode: 'ADMIN2024',
    },
  });
  console.log(`  ✅ Admin cree: ${adminUser.email}`);

  // Freelances
  const freelanceUser1 = await prisma.user.create({
    data: {
      email: 'jean.dupont@email.com',
      password: passwordHash,
      userType: UserType.FREELANCE,
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '0612345678',
      adresse: '15 rue de la Paix',
      ville: 'Lyon',
      codePostal: '69001',
      latitude: 45.764043,
      longitude: 4.835659,
      referralCode: 'JEAN2024',
    },
  });

  const freelanceUser2 = await prisma.user.create({
    data: {
      email: 'marie.martin@email.com',
      password: passwordHash,
      userType: UserType.FREELANCE,
      nom: 'Martin',
      prenom: 'Marie',
      telephone: '0623456789',
      adresse: '8 avenue Victor Hugo',
      ville: 'Marseille',
      codePostal: '13001',
      latitude: 43.296482,
      longitude: 5.36978,
      referralCode: 'MARIE2024',
    },
  });

  const freelanceUser3 = await prisma.user.create({
    data: {
      email: 'pierre.bernard@email.com',
      password: passwordHash,
      userType: UserType.FREELANCE,
      nom: 'Bernard',
      prenom: 'Pierre',
      telephone: '0634567890',
      ville: 'Toulouse',
      codePostal: '31000',
      latitude: 43.604652,
      longitude: 1.444209,
      referralCode: 'PIERRE2024',
    },
  });

  console.log(`  ✅ 3 utilisateurs freelance crees`);

  // Entreprises
  const entrepriseUser1 = await prisma.user.create({
    data: {
      email: 'contact@btpconstruction.fr',
      password: passwordHash,
      userType: UserType.ENTREPRISE,
      nom: 'Leroy',
      prenom: 'Marc',
      telephone: '0145678901',
      ville: 'Paris',
      codePostal: '75008',
      latitude: 48.856614,
      longitude: 2.352222,
      referralCode: 'BTP2024',
    },
  });

  const entrepriseUser2 = await prisma.user.create({
    data: {
      email: 'direction@renovexpert.fr',
      password: passwordHash,
      userType: UserType.ENTREPRISE,
      nom: 'Moreau',
      prenom: 'Sophie',
      telephone: '0456789012',
      ville: 'Bordeaux',
      codePostal: '33000',
      latitude: 44.837789,
      longitude: -0.57918,
      referralCode: 'RENOV2024',
    },
  });

  console.log(`  ✅ 2 utilisateurs entreprise crees`);

  // Utilisateur Appel d'Offre (particulier)
  const aoUser = await prisma.user.create({
    data: {
      email: 'particulier@email.com',
      password: passwordHash,
      userType: UserType.APPEL_OFFRE,
      nom: 'Petit',
      prenom: 'Francois',
      telephone: '0667890123',
      ville: 'Nice',
      codePostal: '06000',
      referralCode: 'PART2024',
    },
  });
  console.log(`  ✅ 1 utilisateur appel d'offre cree`);

  // ============================================
  // 3. CREATION DES PROFILS FREELANCE
  // ============================================
  console.log('🔧 Creation des profils freelance...');

  const freelance1 = await prisma.freelance.create({
    data: {
      userId: freelanceUser1.id,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      telephone: '0612345678',
      metier: 'Electricien',
      tarif: 350,
      modeTarification: ModeTarification.JOUR,
      disponible: true,
      experienceYears: 15,
      description:
        "Electricien qualifie avec 15 ans d'experience. Specialise dans les installations industrielles et tertiaires. Habilitations electriques a jour.",
      siret: '12345678901234',
      statutCompte: StatutCompte.VALIDE,
    },
  });

  const freelance2 = await prisma.freelance.create({
    data: {
      userId: freelanceUser2.id,
      nom: 'Martin',
      prenom: 'Marie',
      email: 'marie.martin@email.com',
      telephone: '0623456789',
      metier: 'Plombier',
      tarif: 45,
      modeTarification: ModeTarification.HEURE,
      disponible: true,
      experienceYears: 8,
      description:
        'Plombiere certifiee RGE. Interventions rapides pour depannages et installations completes.',
      siret: '23456789012345',
      statutCompte: StatutCompte.VALIDE,
    },
  });

  const freelance3 = await prisma.freelance.create({
    data: {
      userId: freelanceUser3.id,
      nom: 'Bernard',
      prenom: 'Pierre',
      email: 'pierre.bernard@email.com',
      telephone: '0634567890',
      metier: 'Macon',
      tarif: 280,
      modeTarification: ModeTarification.JOUR,
      disponible: false,
      experienceYears: 20,
      description:
        'Macon traditionnel. Specialiste de la renovation de batiments anciens et construction neuve.',
      siret: '34567890123456',
      statutCompte: StatutCompte.VALIDE,
    },
  });

  console.log(`  ✅ 3 profils freelance crees`);

  // ============================================
  // 4. CREATION DES PROFILS ENTREPRISE
  // ============================================
  console.log('🏢 Creation des profils entreprise...');

  const entreprise1 = await prisma.entreprise.create({
    data: {
      userId: entrepriseUser1.id,
      raisonSociale: 'BTP Construction SAS',
      siret: '98765432109876',
      formeJuridique: 'SAS',
      nafCode: '4120A',
      representantLegal: 'Marc Leroy',
      email: 'contact@btpconstruction.fr',
      telephone: '0145678901',
      adresse: '45 boulevard Haussmann',
      ville: 'Paris',
      codePostal: '75008',
      description:
        "Entreprise generale de construction. Plus de 50 ans d'experience dans le BTP.",
      statutCompte: StatutCompte.VALIDE,
    },
  });

  const entreprise2 = await prisma.entreprise.create({
    data: {
      userId: entrepriseUser2.id,
      raisonSociale: "Renov'Expert SARL",
      siret: '87654321098765',
      formeJuridique: 'SARL',
      nafCode: '4399C',
      representantLegal: 'Sophie Moreau',
      email: 'direction@renovexpert.fr',
      telephone: '0456789012',
      adresse: "12 cours de l'Intendance",
      ville: 'Bordeaux',
      codePostal: '33000',
      description: 'Specialiste de la renovation energetique. Certifie RGE.',
      statutCompte: StatutCompte.VALIDE,
    },
  });

  console.log(`  ✅ 2 profils entreprise crees`);

  // ============================================
  // 5. CREATION DES APPELS D'OFFRES
  // ============================================
  console.log("📢 Creation des appels d'offres...");

  const appelOffre1 = await prisma.appelOffre.create({
    data: {
      titre: 'Renovation electrique immeuble bureaux',
      description:
        "Renovation complete de l'installation electrique d'un immeuble de bureaux de 2000m2. Mise aux normes et installation de nouveaux tableaux.",
      budget: '50000-80000',
      ville: 'Paris',
      typeConstruction: 'Tertiaire',
      secteur: 'Electricite',
      typePersonne: TypePersonne.PROFESSIONNEL,
      entrepriseId: entreprise1.id,
      statutCompte: AppelOffreStatus.PUBLIE,
      dateLimite: new Date('2026-03-15'),
    },
  });

  const appelOffre2 = await prisma.appelOffre.create({
    data: {
      titre: 'Construction maison individuelle',
      description:
        "Construction d'une maison individuelle de 150m2 sur terrain de 800m2. Gros oeuvre et second oeuvre.",
      budget: '200000-250000',
      ville: 'Bordeaux',
      typeConstruction: 'Residentiel',
      secteur: 'Construction',
      typePersonne: TypePersonne.PROFESSIONNEL,
      entrepriseId: entreprise2.id,
      statutCompte: AppelOffreStatus.PUBLIE,
      dateLimite: new Date('2026-04-01'),
    },
  });

  const appelOffre3 = await prisma.appelOffre.create({
    data: {
      titre: 'Renovation salle de bain',
      description:
        "Renovation complete d'une salle de bain de 8m2. Plomberie, carrelage et electricite.",
      budget: '8000-12000',
      ville: 'Nice',
      typeConstruction: 'Residentiel',
      secteur: 'Plomberie',
      typePersonne: TypePersonne.PARTICULIER,
      statutCompte: AppelOffreStatus.PUBLIE,
      dateLimite: new Date('2026-02-28'),
    },
  });

  // Appel d'offre scrape (exemple)
  const appelOffre4 = await prisma.appelOffre.create({
    data: {
      titre: 'Marche public - Refection toiture ecole',
      description:
        "Refection complete de la toiture de l'ecole primaire Jean Moulin. Surface: 500m2.",
      budget: '80000-100000',
      ville: 'Lyon',
      typeConstruction: 'Public',
      secteur: 'Couverture',
      typePersonne: TypePersonne.PROFESSIONNEL,
      urlSource: 'https://www.marches-publics.gouv.fr/exemple',
      statutCompte: AppelOffreStatus.PUBLIE,
      dateLimite: new Date('2026-03-30'),
    },
  });

  console.log(`  ✅ 4 appels d'offres crees`);

  // ============================================
  // 6. CREATION DES CANDIDATURES
  // ============================================
  console.log('📝 Creation des candidatures...');

  await prisma.appelOffreCandidature.create({
    data: {
      appelOffreId: appelOffre1.id,
      freelanceId: freelance1.id,
      typeCandidat: TypeCandidature.FREELANCE,
      proposition:
        "Fort de mes 15 ans d'experience en electricite industrielle, je propose mes services pour ce chantier. Disponible immediatement.",
      budgetPropose: 65000,
      dureeProposee: '3 mois',
      statut: CandidatureStatus.EN_ATTENTE,
    },
  });

  await prisma.appelOffreCandidature.create({
    data: {
      appelOffreId: appelOffre3.id,
      freelanceId: freelance2.id,
      typeCandidat: TypeCandidature.FREELANCE,
      proposition:
        'Specialisee dans la renovation de salles de bain, je peux realiser ce projet en 2 semaines.',
      budgetPropose: 9500,
      dureeProposee: '2 semaines',
      statut: CandidatureStatus.ACCEPTE,
    },
  });

  console.log(`  ✅ 2 candidatures creees`);

  // ============================================
  // 7. CREATION DES CONTRATS
  // ============================================
  console.log('📄 Creation des contrats...');

  const contrat1 = await prisma.contrat.create({
    data: {
      titre: 'Renovation salle de bain - M. Petit',
      description: 'Renovation complete de la salle de bain selon devis accepte.',
      montant: 9500,
      statut: ContratStatus.SIGNE,
      bothPartiesSigned: true,
      signatureCompletedAt: new Date(),
      entrepriseId: entreprise2.id,
      freelanceId: freelance2.id,
      appelOffreId: appelOffre3.id,
      dateDebut: new Date('2026-02-15'),
      dateFin: new Date('2026-03-01'),
    },
  });

  const contrat2 = await prisma.contrat.create({
    data: {
      titre: 'Mission electricite - Chantier Bordeaux',
      description: 'Installation electrique pour nouvelle construction.',
      montant: 15000,
      statut: ContratStatus.EN_ATTENTE,
      entrepriseId: entreprise2.id,
      freelanceId: freelance1.id,
      dateDebut: new Date('2026-03-01'),
      dateFin: new Date('2026-03-15'),
    },
  });

  console.log(`  ✅ 2 contrats crees`);

  // ============================================
  // 8. CREATION DES SIGNATURES
  // ============================================
  console.log('✍️ Creation des signatures...');

  await prisma.contractSignature.create({
    data: {
      contratId: contrat1.id,
      signerId: freelance2.id,
      signerType: SignerType.FREELANCE,
      signerName: 'Marie Martin',
      ipAddress: '192.168.1.100',
    },
  });

  await prisma.contractSignature.create({
    data: {
      contratId: contrat1.id,
      signerId: entreprise2.id,
      signerType: SignerType.ENTREPRISE,
      signerName: "Sophie Moreau - Renov'Expert SARL",
      ipAddress: '192.168.1.200',
    },
  });

  console.log(`  ✅ 2 signatures creees`);

  // ============================================
  // 9. CREATION DES MESSAGES
  // ============================================
  console.log('💬 Creation des messages...');

  await prisma.message.create({
    data: {
      senderId: entrepriseUser2.id,
      senderType: 'ENTREPRISE',
      receiverId: freelanceUser2.id,
      receiverType: 'FREELANCE',
      contenu:
        'Bonjour Marie, nous avons bien recu votre candidature. Pouvez-vous nous envoyer des photos de vos realisations precedentes ?',
      contratId: contrat1.id,
    },
  });

  await prisma.message.create({
    data: {
      senderId: freelanceUser2.id,
      senderType: 'FREELANCE',
      receiverId: entrepriseUser2.id,
      receiverType: 'ENTREPRISE',
      contenu:
        'Bonjour, merci pour votre retour. Je vous envoie mon portfolio par email dans la journee.',
      contratId: contrat1.id,
      lu: true,
    },
  });

  console.log(`  ✅ 2 messages crees`);

  // ============================================
  // 10. CREATION DES NOTIFICATIONS
  // ============================================
  console.log('🔔 Creation des notifications...');

  await prisma.notification.create({
    data: {
      destinataireId: freelanceUser1.id,
      destinataireType: 'FREELANCE',
      typeNotification: NotificationType.APPEL_OFFRE,
      titre: "Nouvel appel d'offre",
      message:
        'Un nouvel appel d\'offre correspondant a votre profil a ete publie: "Renovation electrique immeuble bureaux"',
    },
  });

  await prisma.notification.create({
    data: {
      destinataireId: freelanceUser2.id,
      destinataireType: 'FREELANCE',
      typeNotification: NotificationType.CONTRAT,
      titre: 'Contrat signe',
      message:
        'Le contrat "Renovation salle de bain - M. Petit" a ete signe par les deux parties.',
      contratId: contrat1.id,
      lu: true,
    },
  });

  await prisma.notification.create({
    data: {
      destinataireId: entrepriseUser2.id,
      destinataireType: 'ENTREPRISE',
      typeNotification: NotificationType.MESSAGE,
      titre: 'Nouveau message',
      message: 'Vous avez recu un nouveau message de Marie Martin.',
    },
  });

  console.log(`  ✅ 3 notifications creees`);

  // ============================================
  // RESUME
  // ============================================
  console.log('\n========================================');
  console.log('🎉 Seed termine avec succes !');
  console.log('========================================');
  console.log('📊 Resume des donnees creees:');
  console.log(`   - ${await prisma.user.count()} utilisateurs`);
  console.log(`   - ${await prisma.freelance.count()} freelances`);
  console.log(`   - ${await prisma.entreprise.count()} entreprises`);
  console.log(`   - ${await prisma.appelOffre.count()} appels d'offres`);
  console.log(`   - ${await prisma.appelOffreCandidature.count()} candidatures`);
  console.log(`   - ${await prisma.contrat.count()} contrats`);
  console.log(`   - ${await prisma.contractSignature.count()} signatures`);
  console.log(`   - ${await prisma.message.count()} messages`);
  console.log(`   - ${await prisma.notification.count()} notifications`);
  console.log('========================================');
  console.log('\n🔐 Comptes de test:');
  console.log('   Admin:      admin@marchesbtp.fr / Password123!');
  console.log('   Freelance:  jean.dupont@email.com / Password123!');
  console.log('   Entreprise: contact@btpconstruction.fr / Password123!');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
