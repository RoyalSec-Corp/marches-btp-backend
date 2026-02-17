import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Interfaces
// ============================================

export interface CreateAppelOffreData {
  titre: string;
  description?: string;
  budget?: string;
  ville?: string;
  typeConstruction?: string;
  secteur?: string;
  cible?: string;
  dateLimite?: string;
  typePersonne?: 'PARTICULIER' | 'PROFESSIONNEL';
}

export interface ListFilters {
  page?: number;
  limit?: number;
  localisation?: string;
  type_construction?: string;
  budget_min?: number;
  budget_max?: number;
  mots_cles?: string[];
  publisher_only?: boolean;
  userId?: number;
}

export interface ApplyData {
  proposition?: string;
  budgetPropose?: number;
  dureeProposee?: string;
  typeCandidat: 'FREELANCE' | 'ENTREPRISE';
}

// ============================================
// Service
// ============================================

class AppelOffreService {
  /**
   * Trouver tous les AO appartenant à un userId
   * Cherche par publisherId OU par entrepriseId (fallback pour anciens AO)
   */
  private async buildOwnerFilter(userId: number): Promise<Prisma.AppelOffreWhereInput> {
    const conditions: Prisma.AppelOffreWhereInput[] = [{ publisherId: userId }];

    // Fallback: chercher aussi par entrepriseId pour les anciens AO sans publisherId
    const entreprise = await prisma.entreprise.findUnique({ where: { userId } });
    if (entreprise) {
      conditions.push({ entrepriseId: entreprise.id, publisherId: null });
    }

    return { OR: conditions };
  }

  /**
   * Créer un appel d'offre
   * publisherId = userId du créateur (toujours stocké)
   */
  async create(userId: number, data: CreateAppelOffreData) {
    const entreprise = await prisma.entreprise.findUnique({ where: { userId } });

    const appelOffre = await prisma.appelOffre.create({
      data: {
        titre: data.titre,
        description: data.description,
        budget: data.budget,
        ville: data.ville,
        typeConstruction: data.typeConstruction,
        secteur: data.secteur,
        cible: data.cible || 'TOUS',
        typePersonne: data.typePersonne || 'PROFESSIONNEL',
        dateLimite: data.dateLimite ? new Date(data.dateLimite) : undefined,
        statutCompte: 'PUBLIE',
        publisherId: userId,
        entrepriseId: entreprise?.id || null,
        adminId: null,
      },
      include: {
        entreprise: { select: { raisonSociale: true } },
        _count: { select: { candidatures: true } },
      },
    });

    // Auto-fix: mettre à jour les anciens AO du même user qui n'ont pas de publisherId
    try {
      if (entreprise) {
        await prisma.appelOffre.updateMany({
          where: { entrepriseId: entreprise.id, publisherId: null },
          data: { publisherId: userId },
        });
      }
    } catch (err) {
      console.error('Auto-fix publisherId échoué:', err);
    }

    return appelOffre;
  }

  /**
   * Lister les appels d'offre avec filtres et pagination
   */
  async findAll(filters: ListFilters) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.AppelOffreWhereInput = {};

    if (filters.publisher_only && filters.userId) {
      // Chercher par publisherId OU entrepriseId (fallback anciens AO)
      const ownerFilter = await this.buildOwnerFilter(filters.userId);
      Object.assign(where, ownerFilter);
    }

    if (filters.localisation) {
      where.ville = { contains: filters.localisation, mode: 'insensitive' };
    }
    if (filters.type_construction) {
      where.typeConstruction = { contains: filters.type_construction, mode: 'insensitive' };
    }
    if (filters.mots_cles && filters.mots_cles.length > 0) {
      // Si on a déjà un OR du ownerFilter, on doit combiner avec AND
      const motsClesFilter = filters.mots_cles.map((mot) => ({
        OR: [
          { titre: { contains: mot, mode: 'insensitive' as const } },
          { description: { contains: mot, mode: 'insensitive' as const } },
        ],
      }));

      if (where.OR) {
        // Combiner ownerFilter OR avec mots_cles
        const ownerOR = where.OR;
        delete where.OR;
        where.AND = [{ OR: ownerOR as Prisma.AppelOffreWhereInput[] }, ...motsClesFilter];
      } else {
        where.OR = filters.mots_cles.map((mot) => ({
          OR: [
            { titre: { contains: mot, mode: 'insensitive' as const } },
            { description: { contains: mot, mode: 'insensitive' as const } },
          ],
        }));
      }
    }

    const [total, appels] = await Promise.all([
      prisma.appelOffre.count({ where }),
      prisma.appelOffre.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateCreation: 'desc' },
        include: {
          entreprise: { select: { raisonSociale: true } },
          _count: { select: { candidatures: true } },
        },
      }),
    ]);

    const calls_for_tenders = appels.map((a) => ({
      id: a.id,
      titre: a.titre,
      description: a.description,
      budget: a.budget,
      ville: a.ville,
      type_construction: a.typeConstruction,
      secteur: a.secteur,
      cible: a.cible,
      type_personne: a.typePersonne,
      statut:
        a.statutCompte === 'PUBLIE'
          ? 'published'
          : a.statutCompte === 'CLOTURE'
            ? 'closed'
            : a.statutCompte === 'BROUILLON'
              ? 'draft'
              : 'cancelled',
      date_limite: a.dateLimite,
      created_at: a.dateCreation,
      company_name: a.entreprise?.raisonSociale || null,
      entreprise_id: a.entrepriseId,
      publisher_id: a.publisherId,
      candidatures_count: a._count.candidatures,
    }));

    return {
      calls_for_tenders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer un appel d'offre par ID
   */
  async findById(id: number) {
    const appel = await prisma.appelOffre.findUnique({
      where: { id },
      include: {
        entreprise: { select: { raisonSociale: true, ville: true } },
        _count: { select: { candidatures: true } },
        candidatures: {
          include: {
            freelance: {
              include: { user: { select: { nom: true, prenom: true, email: true } } },
            },
          },
        },
      },
    });

    if (!appel) {
      return null;
    }

    return {
      id: appel.id,
      titre: appel.titre,
      description: appel.description,
      budget: appel.budget,
      ville: appel.ville,
      type_construction: appel.typeConstruction,
      secteur: appel.secteur,
      cible: appel.cible,
      type_personne: appel.typePersonne,
      statut: appel.statutCompte,
      date_limite: appel.dateLimite,
      created_at: appel.dateCreation,
      company_name: appel.entreprise?.raisonSociale || null,
      entreprise_id: appel.entrepriseId,
      publisher_id: appel.publisherId,
      candidatures_count: appel._count.candidatures,
      candidatures: appel.candidatures,
    };
  }

  /**
   * Statistiques pour le dashboard
   */
  async getStatistics(userId?: number) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Filtrer par owner (publisherId OU entrepriseId fallback)
    let userFilter: Prisma.AppelOffreWhereInput = {};
    if (userId) {
      userFilter = await this.buildOwnerFilter(userId);
    }

    const appels = await prisma.appelOffre.findMany({
      where: { dateCreation: { gte: sixMonthsAgo }, ...userFilter },
      select: {
        id: true,
        dateCreation: true,
        budget: true,
        _count: { select: { candidatures: true } },
      },
      orderBy: { dateCreation: 'asc' },
    });

    // Grouper par mois
    const monthlyMap = new Map<string, { calls_created: number; applications_received: number }>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { calls_created: 0, applications_received: 0 });
    }

    for (const appel of appels) {
      const key = `${appel.dateCreation.getFullYear()}-${String(appel.dateCreation.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.calls_created++;
        entry.applications_received += appel._count.candidatures;
      }
    }

    const monthly_data = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month: `${month}-01`,
      ...data,
    }));

    // Répartition par budget
    const allAppels = await prisma.appelOffre.findMany({
      where: userFilter,
      select: { budget: true },
    });

    const budgetRanges = [
      { range: '< 5 000 \u20ac', min: 0, max: 5000 },
      { range: '5 000 \u20ac - 20 000 \u20ac', min: 5000, max: 20000 },
      { range: '20 000 \u20ac - 50 000 \u20ac', min: 20000, max: 50000 },
      { range: '50 000 \u20ac - 100 000 \u20ac', min: 50000, max: 100000 },
      { range: '> 100 000 \u20ac', min: 100000, max: Infinity },
    ];

    const budget_distribution = budgetRanges.map((range) => {
      const count = allAppels.filter((a) => {
        const val = parseFloat((a.budget || '0').replace(/[^\d.,]/g, '').replace(',', '.'));
        return val >= range.min && val < range.max;
      }).length;
      return { range: range.range, count };
    });

    // Compteurs — utiliser les IDs trouvés
    const userAppelIds = appels.map((a) => a.id);
    const appelsActifs = await prisma.appelOffre.count({
      where: { statutCompte: 'PUBLIE', ...userFilter },
    });
    const totalAppels = await prisma.appelOffre.count({ where: userFilter });

    let totalCandidatures = 0;
    if (userId && userAppelIds.length > 0) {
      totalCandidatures = await prisma.appelOffreCandidature.count({
        where: { appelOffreId: { in: userAppelIds } },
      });
    } else if (!userId) {
      totalCandidatures = await prisma.appelOffreCandidature.count();
    }

    let activeProjects = 0;
    let completedProjects = 0;
    try {
      activeProjects = await prisma.contrat.count({ where: { statut: 'EN_COURS' } });
      completedProjects = await prisma.contrat.count({ where: { statut: 'TERMINE' } });
    } catch {
      // Table contrats peut ne pas encore avoir de données
    }

    return {
      active_calls: appelsActifs,
      total_applications: totalCandidatures,
      active_projects: activeProjects,
      completed_projects: completedProjects,
      monthly_data,
      budget_distribution,
      total_appels: totalAppels,
      appels_actifs: appelsActifs,
      total_candidatures: totalCandidatures,
    };
  }

  /**
   * Postuler à un appel d'offre
   */
  async apply(appelOffreId: number, userId: number, data: ApplyData) {
    const appel = await prisma.appelOffre.findUnique({ where: { id: appelOffreId } });
    if (!appel) {
      throw new Error("Appel d'offre non trouvé");
    }

    let freelanceId: number | null = null;
    let entrepriseId: number | null = null;

    if (data.typeCandidat === 'FREELANCE') {
      const freelance = await prisma.freelance.findUnique({ where: { userId } });
      if (!freelance) {
        throw new Error('Profil freelance non trouvé');
      }
      freelanceId = freelance.id;
    } else {
      const entreprise = await prisma.entreprise.findUnique({ where: { userId } });
      if (!entreprise) {
        throw new Error('Profil entreprise non trouvé');
      }
      entrepriseId = entreprise.id;
    }

    const candidature = await prisma.appelOffreCandidature.create({
      data: {
        appelOffreId,
        freelanceId,
        entrepriseId,
        typeCandidat: data.typeCandidat,
        proposition: data.proposition,
        budgetPropose: data.budgetPropose,
        dureeProposee: data.dureeProposee,
        statut: 'EN_ATTENTE',
      },
    });

    // Notifier le publisher de l'AO
    const publisherUserId = appel.publisherId;
    if (publisherUserId) {
      try {
        await prisma.notification.create({
          data: {
            userId: publisherUserId,
            type: 'CANDIDATURE',
            titre: 'Nouvelle candidature reçue',
            message: `Vous avez reçu une nouvelle candidature pour "${appel.titre}"`,
            lien: `/dashboard-appel-offre/candidatures`,
          },
        });
      } catch (err) {
        console.error('Erreur notification candidature:', err);
      }
    }

    return candidature;
  }

  /**
   * Lister les candidatures d'un AO
   */
  async listApplications(appelOffreId: number) {
    const candidatures = await prisma.appelOffreCandidature.findMany({
      where: { appelOffreId },
      include: {
        freelance: {
          include: { user: { select: { nom: true, prenom: true, email: true } } },
        },
        entreprise: { select: { raisonSociale: true } },
      },
      orderBy: { datePostulation: 'desc' },
    });

    return candidatures.map((c) => ({
      id: c.id,
      appel_offre_id: c.appelOffreId,
      type_candidat: c.typeCandidat,
      proposition: c.proposition,
      budget_propose: c.budgetPropose,
      duree_proposee: c.dureeProposee,
      statut: c.statut,
      date_postulation: c.datePostulation,
      candidat_nom: c.freelance
        ? `${c.freelance.user.prenom} ${c.freelance.user.nom}`
        : c.entreprise?.raisonSociale || 'Inconnu',
      candidat_email: c.freelance?.user.email || null,
      freelance_id: c.freelanceId,
      entreprise_id: c.entrepriseId,
    }));
  }

  /**
   * Accepter une candidature
   */
  async acceptApplication(appelOffreId: number, applicationId: number) {
    return prisma.appelOffreCandidature.update({
      where: { id: applicationId },
      data: { statut: 'ACCEPTE' },
    });
  }

  /**
   * Refuser une candidature
   */
  async rejectApplication(appelOffreId: number, applicationId: number) {
    return prisma.appelOffreCandidature.update({
      where: { id: applicationId },
      data: { statut: 'REFUSE' },
    });
  }
}

export const appelOffreService = new AppelOffreService();
export default appelOffreService;
