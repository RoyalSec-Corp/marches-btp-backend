import { PrismaClient, ContratStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateContratInput {
  titre: string;
  description?: string;
  montant: number;
  entrepriseId: number;
  freelanceId: number;
  appelOffreId?: number;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface UpdateContratInput {
  titre?: string;
  description?: string;
  montant?: number;
  dateDebut?: Date;
  dateFin?: Date;
  statut?: ContratStatus;
  progressStage?: string;
}

export interface ContratFilters {
  statut?: ContratStatus;
  entrepriseId?: number;
  freelanceId?: number;
  appelOffreId?: number;
  dateDebutFrom?: Date;
  dateDebutTo?: Date;
}

class ContratService {
  /**
   * Créer un nouveau contrat
   */
  async create(data: CreateContratInput, _creatorId: number): Promise<any> {
    // Vérifier que l'entreprise existe
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: data.entrepriseId },
    });
    if (!entreprise) {
      throw new Error('Entreprise non trouvée');
    }

    // Vérifier que le freelance existe
    const freelance = await prisma.freelance.findUnique({
      where: { id: data.freelanceId },
    });
    if (!freelance) {
      throw new Error('Freelance non trouvé');
    }

    // Créer le contrat
    const contrat = await prisma.contrat.create({
      data: {
        titre: data.titre,
        description: data.description,
        montant: data.montant,
        entrepriseId: data.entrepriseId,
        freelanceId: data.freelanceId,
        appelOffreId: data.appelOffreId,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        statut: ContratStatus.BROUILLON,
      },
      include: {
        entreprise: {
          include: {
            user: { select: { id: true, email: true, nom: true, prenom: true } },
          },
        },
        freelance: {
          include: {
            user: { select: { id: true, email: true, nom: true, prenom: true } },
          },
        },
        appelOffre: true,
      },
    });

    return contrat;
  }

  /**
   * Récupérer un contrat par ID
   */
  async findById(id: number): Promise<any> {
    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: {
        entreprise: {
          include: {
            user: { select: { id: true, email: true, nom: true, prenom: true } },
          },
        },
        freelance: {
          include: {
            user: { select: { id: true, email: true, nom: true, prenom: true } },
          },
        },
        appelOffre: true,
        signatures: true,
        documents: true,
        milestones: true,
      },
    });

    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    return contrat;
  }

  /**
   * Lister les contrats avec filtres et pagination
   */
  async list(
    filters: ContratFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: Prisma.ContratWhereInput = {};

    if (filters.statut) {
      where.statut = filters.statut;
    }
    if (filters.entrepriseId) {
      where.entrepriseId = filters.entrepriseId;
    }
    if (filters.freelanceId) {
      where.freelanceId = filters.freelanceId;
    }
    if (filters.appelOffreId) {
      where.appelOffreId = filters.appelOffreId;
    }
    if (filters.dateDebutFrom || filters.dateDebutTo) {
      where.dateDebut = {};
      if (filters.dateDebutFrom) {
        where.dateDebut.gte = filters.dateDebutFrom;
      }
      if (filters.dateDebutTo) {
        where.dateDebut.lte = filters.dateDebutTo;
      }
    }

    const [data, total] = await Promise.all([
      prisma.contrat.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          entreprise: {
            include: {
              user: { select: { id: true, nom: true, prenom: true } },
            },
          },
          freelance: {
            include: {
              user: { select: { id: true, nom: true, prenom: true } },
            },
          },
        },
      }),
      prisma.contrat.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer les contrats d'un utilisateur (freelance ou entreprise)
   * Retourne liste vide si le profil n'existe pas encore
   */
  async listByUser(
    userId: number,
    userType: 'FREELANCE' | 'ENTREPRISE',
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    const where: Prisma.ContratWhereInput = {};

    if (userType === 'FREELANCE') {
      const freelance = await prisma.freelance.findUnique({ where: { userId } });
      if (!freelance) {
        // Profil pas encore créé, retourner liste vide
        return { data: [], total: 0, page, totalPages: 0 };
      }
      where.freelanceId = freelance.id;
    } else {
      const entreprise = await prisma.entreprise.findUnique({ where: { userId } });
      if (!entreprise) {
        // Profil pas encore créé, retourner liste vide
        return { data: [], total: 0, page, totalPages: 0 };
      }
      where.entrepriseId = entreprise.id;
    }

    return this.list(where, page, limit);
  }

  /**
   * Mettre à jour un contrat
   */
  async update(id: number, data: UpdateContratInput): Promise<any> {
    const contrat = await prisma.contrat.findUnique({ where: { id } });
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    // On ne peut modifier que les contrats en brouillon ou en attente
    if (contrat.statut !== ContratStatus.BROUILLON && contrat.statut !== ContratStatus.EN_ATTENTE) {
      throw new Error('Impossible de modifier un contrat déjà signé ou en cours');
    }

    return prisma.contrat.update({
      where: { id },
      data,
      include: {
        entreprise: true,
        freelance: true,
      },
    });
  }

  /**
   * Envoyer le contrat pour signature
   */
  async sendForSignature(id: number): Promise<any> {
    const contrat = await prisma.contrat.findUnique({ where: { id } });
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    if (contrat.statut !== ContratStatus.BROUILLON) {
      throw new Error('Seul un contrat en brouillon peut être envoyé pour signature');
    }

    return prisma.contrat.update({
      where: { id },
      data: { statut: ContratStatus.EN_ATTENTE },
    });
  }

  /**
   * Signer un contrat
   */
  async sign(contratId: number, userId: number, signatureData: string): Promise<any> {
    const contrat = await prisma.contrat.findUnique({
      where: { id: contratId },
      include: { freelance: true, entreprise: true, signatures: true },
    });

    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    if (contrat.statut !== ContratStatus.EN_ATTENTE) {
      throw new Error("Ce contrat n'est pas en attente de signature");
    }

    // Déterminer le type de signataire
    let signerType: 'FREELANCE' | 'ENTREPRISE';
    if (contrat.freelance.userId === userId) {
      signerType = 'FREELANCE';
    } else if (contrat.entreprise.userId === userId) {
      signerType = 'ENTREPRISE';
    } else {
      throw new Error("Vous n'êtes pas autorisé à signer ce contrat");
    }

    // Vérifier si déjà signé
    const existingSignature = contrat.signatures.find((s) => s.signerType === signerType);
    if (existingSignature) {
      throw new Error('Vous avez déjà signé ce contrat');
    }

    // Créer la signature
    await prisma.contractSignature.create({
      data: {
        contratId,
        signerType,
        signatureData,
        signedAt: new Date(),
        ipAddress: '', // À remplir depuis le controller
      },
    });

    // Vérifier si les deux parties ont signé
    const allSignatures = await prisma.contractSignature.findMany({
      where: { contratId },
    });

    const bothSigned = allSignatures.length === 2;

    // Mettre à jour le contrat
    return prisma.contrat.update({
      where: { id: contratId },
      data: {
        bothPartiesSigned: bothSigned,
        signatureCompletedAt: bothSigned ? new Date() : null,
        statut: bothSigned ? ContratStatus.SIGNE : ContratStatus.EN_ATTENTE,
      },
      include: {
        signatures: true,
        entreprise: true,
        freelance: true,
      },
    });
  }

  /**
   * Démarrer un contrat (après signature)
   */
  async start(id: number): Promise<any> {
    const contrat = await prisma.contrat.findUnique({ where: { id } });
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    if (contrat.statut !== ContratStatus.SIGNE) {
      throw new Error('Seul un contrat signé peut être démarré');
    }

    return prisma.contrat.update({
      where: { id },
      data: {
        statut: ContratStatus.EN_COURS,
        dateDebut: contrat.dateDebut || new Date(),
      },
    });
  }

  /**
   * Terminer un contrat
   */
  async complete(id: number): Promise<any> {
    const contrat = await prisma.contrat.findUnique({ where: { id } });
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    if (contrat.statut !== ContratStatus.EN_COURS) {
      throw new Error('Seul un contrat en cours peut être terminé');
    }

    return prisma.contrat.update({
      where: { id },
      data: {
        statut: ContratStatus.TERMINE,
        dateFin: new Date(),
      },
    });
  }

  /**
   * Annuler un contrat
   */
  async cancel(id: number, reason?: string): Promise<any> {
    const contrat = await prisma.contrat.findUnique({ where: { id } });
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    if (contrat.statut === ContratStatus.TERMINE || contrat.statut === ContratStatus.ANNULE) {
      throw new Error('Ce contrat ne peut pas être annulé');
    }

    return prisma.contrat.update({
      where: { id },
      data: {
        statut: ContratStatus.ANNULE,
        description: reason
          ? `${contrat.description || ''}\n\n[ANNULATION] ${reason}`
          : contrat.description,
      },
    });
  }

  /**
   * Obtenir les statistiques des contrats
   */
  async getStats(userId?: number, userType?: 'FREELANCE' | 'ENTREPRISE'): Promise<any> {
    const where: Prisma.ContratWhereInput = {};

    if (userId && userType) {
      if (userType === 'FREELANCE') {
        const freelance = await prisma.freelance.findUnique({ where: { userId } });
        if (freelance) {
          where.freelanceId = freelance.id;
        }
      } else {
        const entreprise = await prisma.entreprise.findUnique({ where: { userId } });
        if (entreprise) {
          where.entrepriseId = entreprise.id;
        }
      }
    }

    const [total, enCours, termines, montantTotal] = await Promise.all([
      prisma.contrat.count({ where }),
      prisma.contrat.count({ where: { ...where, statut: ContratStatus.EN_COURS } }),
      prisma.contrat.count({ where: { ...where, statut: ContratStatus.TERMINE } }),
      prisma.contrat.aggregate({
        where: { ...where, statut: { in: [ContratStatus.EN_COURS, ContratStatus.TERMINE] } },
        _sum: { montant: true },
      }),
    ]);

    return {
      total,
      enCours,
      termines,
      enAttente: await prisma.contrat.count({
        where: { ...where, statut: ContratStatus.EN_ATTENTE },
      }),
      brouillons: await prisma.contrat.count({
        where: { ...where, statut: ContratStatus.BROUILLON },
      }),
      montantTotal: montantTotal._sum.montant || 0,
    };
  }
}

export const contratService = new ContratService();
export default contratService;
