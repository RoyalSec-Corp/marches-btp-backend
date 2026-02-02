import { PrismaClient, Entreprise, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface UpdateEntrepriseData {
  raisonSociale?: string;
  siret?: string;
  representantLegal?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  formeJuridique?: string;
  siteWeb?: string;
  description?: string;
}

export interface EntrepriseWithUser extends Entreprise {
  user: User;
}

class EntrepriseService {
  /**
   * Récupérer une entreprise par son ID utilisateur
   */
  async findByUserId(userId: string): Promise<EntrepriseWithUser | null> {
    return prisma.entreprise.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  /**
   * Récupérer une entreprise par son ID
   */
  async findById(id: string): Promise<EntrepriseWithUser | null> {
    return prisma.entreprise.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  /**
   * Récupérer une entreprise par son SIRET
   */
  async findBySiret(siret: string): Promise<EntrepriseWithUser | null> {
    return prisma.entreprise.findUnique({
      where: { siret },
      include: { user: true },
    });
  }

  /**
   * Lister toutes les entreprises (avec pagination)
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    ville?: string;
    formeJuridique?: string;
  } = {}): Promise<{ entreprises: EntrepriseWithUser[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, ville, formeJuridique } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ville) where.ville = { contains: ville, mode: 'insensitive' };
    if (formeJuridique) where.formeJuridique = formeJuridique;

    const [entreprises, total] = await Promise.all([
      prisma.entreprise.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.entreprise.count({ where }),
    ]);

    return {
      entreprises,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Mettre à jour le profil d'une entreprise
   */
  async updateProfile(userId: string, data: UpdateEntrepriseData): Promise<EntrepriseWithUser> {
    // Vérifier que l'entreprise existe
    const existing = await prisma.entreprise.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new Error('Profil entreprise non trouvé');
    }

    // Si le SIRET est modifié, vérifier qu'il n'est pas déjà utilisé
    if (data.siret && data.siret !== existing.siret) {
      const siretExists = await prisma.entreprise.findFirst({
        where: {
          siret: data.siret,
          userId: { not: userId },
        },
      });
      if (siretExists) {
        throw new Error('Ce numéro SIRET est déjà utilisé par une autre entreprise');
      }
    }

    // Mettre à jour l'entreprise
    const updated = await prisma.entreprise.update({
      where: { userId },
      data: {
        raisonSociale: data.raisonSociale,
        siret: data.siret,
        representantLegal: data.representantLegal,
        telephone: data.telephone,
        adresse: data.adresse,
        ville: data.ville,
        codePostal: data.codePostal,
        formeJuridique: data.formeJuridique,
        siteWeb: data.siteWeb,
        description: data.description,
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    return updated;
  }

  /**
   * Rechercher des entreprises par critères
   */
  async search(query: string, options: { page?: number; limit?: number } = {}): Promise<{
    entreprises: EntrepriseWithUser[];
    total: number;
  }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { raisonSociale: { contains: query, mode: 'insensitive' as const } },
        { ville: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { representantLegal: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [entreprises, total] = await Promise.all([
      prisma.entreprise.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.entreprise.count({ where }),
    ]);

    return { entreprises, total };
  }
}

export const entrepriseService = new EntrepriseService();
export default entrepriseService;
