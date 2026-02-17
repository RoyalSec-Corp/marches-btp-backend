import { PrismaClient, Freelance, User } from '@prisma/client';

const prisma = new PrismaClient();

// Structure des disponibilités par jour
export interface DisponibiliteJour {
  disponible: boolean;
  heureDebut?: string;
  heureFin?: string;
}

export interface DisponibilitesSemaine {
  Lundi?: DisponibiliteJour;
  Mardi?: DisponibiliteJour;
  Mercredi?: DisponibiliteJour;
  Jeudi?: DisponibiliteJour;
  Vendredi?: DisponibiliteJour;
  Samedi?: DisponibiliteJour;
  Dimanche?: DisponibiliteJour;
}

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
  disponibilites?: DisponibilitesSemaine;
  experienceYears?: number;
}

export interface FreelanceWithUser extends Freelance {
  user: User;
}

class FreelanceService {
  /**
   * Récupérer un freelance par son ID utilisateur
   */
  async findByUserId(userId: number): Promise<FreelanceWithUser | null> {
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
      where: { id: parseInt(id, 10) },
      include: { user: true },
    });
  }

  /**
   * Lister tous les freelances (avec pagination)
   */
  async findAll(
    options: {
      page?: number;
      limit?: number;
      metier?: string;
      ville?: string;
      disponible?: boolean;
    } = {}
  ): Promise<{ freelances: FreelanceWithUser[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, metier, ville, disponible } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (metier) {
      where.metier = { contains: metier, mode: 'insensitive' };
    }
    if (ville) {
      where.ville = { contains: ville, mode: 'insensitive' };
    }
    if (disponible !== undefined) {
      where.disponible = disponible;
    }

    const [freelances, total] = await Promise.all([
      prisma.freelance.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { dateInscription: 'desc' },
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
  async updateProfile(userId: number, data: UpdateFreelanceData): Promise<FreelanceWithUser> {
    // Vérifier que le freelance existe
    const existing = await prisma.freelance.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new Error('Profil freelance non trouvé');
    }

    // Construire les données de mise à jour (uniquement les champs définis)
    const updateData: any = {};
    if (data.nom !== undefined) {
      updateData.nom = data.nom;
    }
    if (data.prenom !== undefined) {
      updateData.prenom = data.prenom;
    }
    if (data.telephone !== undefined) {
      updateData.telephone = data.telephone;
    }
    if (data.metier !== undefined) {
      updateData.metier = data.metier;
    }
    if (data.tarif !== undefined) {
      updateData.tarif = data.tarif;
    }
    if (data.siret !== undefined) {
      updateData.siret = data.siret;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.disponible !== undefined) {
      updateData.disponible = data.disponible;
    }
    if (data.disponibilites !== undefined) {
      updateData.disponibilites = data.disponibilites;
    }
    if (data.experienceYears !== undefined) {
      updateData.experienceYears = data.experienceYears;
    }

    // Mettre à jour le freelance
    const updated = await prisma.freelance.update({
      where: { userId },
      data: updateData,
      include: { user: true },
    });

    // Mettre à jour aussi les champs adresse dans User si fournis
    if (data.adresse !== undefined || data.ville !== undefined || data.codePostal !== undefined) {
      const userUpdateData: any = {};
      if (data.adresse !== undefined) {
        userUpdateData.adresse = data.adresse;
      }
      if (data.ville !== undefined) {
        userUpdateData.ville = data.ville;
      }
      if (data.codePostal !== undefined) {
        userUpdateData.codePostal = data.codePostal;
      }

      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    return updated;
  }

  /**
   * Mettre à jour la disponibilité d'un freelance
   */
  async updateDisponibilite(userId: number, disponible: boolean): Promise<Freelance> {
    return prisma.freelance.update({
      where: { userId },
      data: { disponible },
    });
  }

  /**
   * Rechercher des freelances par critères
   */
  async search(
    query: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{
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
        { description: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [freelances, total] = await Promise.all([
      prisma.freelance.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { dateInscription: 'desc' },
      }),
      prisma.freelance.count({ where }),
    ]);

    return { freelances, total };
  }
}

export const freelanceService = new FreelanceService();
export default freelanceService;
