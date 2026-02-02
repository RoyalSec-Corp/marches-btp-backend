import { PrismaClient, Freelance, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface UpdateFreelanceData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  metier?: string;
  tarif?: number;
  siret?: string;
  description?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  disponible?: boolean;
}

export interface FreelanceWithUser extends Freelance {
  user: User;
}

class FreelanceService {
  /**
   * Récupérer un freelance par son ID utilisateur
   */
  async findByUserId(userId: string): Promise<FreelanceWithUser | null> {
    return prisma.freelance.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  /**
   * Récupérer un freelance par son ID
   */
  async findById(id: string): Promise<FreelanceWithUser | null> {
    return prisma.freelance.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  /**
   * Lister tous les freelances (avec pagination)
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    metier?: string;
    ville?: string;
    disponible?: boolean;
  } = {}): Promise<{ freelances: FreelanceWithUser[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, metier, ville, disponible } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (metier) where.metier = { contains: metier, mode: 'insensitive' };
    if (ville) where.ville = { contains: ville, mode: 'insensitive' };
    if (disponible !== undefined) where.disponible = disponible;

    const [freelances, total] = await Promise.all([
      prisma.freelance.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.freelance.count({ where }),
    ]);

    return {
      freelances,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Mettre à jour le profil d'un freelance
   */
  async updateProfile(userId: string, data: UpdateFreelanceData): Promise<FreelanceWithUser> {
    // Vérifier que le freelance existe
    const existing = await prisma.freelance.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new Error('Profil freelance non trouvé');
    }

    // Mettre à jour le freelance
    const updated = await prisma.freelance.update({
      where: { userId },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        metier: data.metier,
        tarif: data.tarif,
        siret: data.siret,
        description: data.description,
        adresse: data.adresse,
        ville: data.ville,
        codePostal: data.codePostal,
        disponible: data.disponible,
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    return updated;
  }

  /**
   * Mettre à jour la disponibilité d'un freelance
   */
  async updateDisponibilite(userId: string, disponible: boolean): Promise<Freelance> {
    return prisma.freelance.update({
      where: { userId },
      data: { disponible, updatedAt: new Date() },
    });
  }

  /**
   * Rechercher des freelances par critères
   */
  async search(query: string, options: { page?: number; limit?: number } = {}): Promise<{
    freelances: FreelanceWithUser[];
    total: number;
  }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { nom: { contains: query, mode: 'insensitive' as const } },
        { prenom: { contains: query, mode: 'insensitive' as const } },
        { metier: { contains: query, mode: 'insensitive' as const } },
        { ville: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [freelances, total] = await Promise.all([
      prisma.freelance.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.freelance.count({ where }),
    ]);

    return { freelances, total };
  }
}

export const freelanceService = new FreelanceService();
export default freelanceService;
