import { Request, Response, NextFunction } from 'express';
import { PrismaClient, AppelOffreStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Utiliser le type existant pour user
interface AuthUser {
  id: number;
  userId: number;
  email: string;
  userType: string;
}

export const appelOffreController = {
  // GET /api/calls-for-tenders - Liste des appels d'offres
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const userId = (req.user as AuthUser | undefined)?.userId;

      // Filtrer par utilisateur connecté si c'est un porteur d'appel d'offres
      const where: Prisma.AppelOffreWhereInput = {};
      if (userId) {
        // Récupérer l'utilisateur pour voir s'il a une entreprise associée
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { entreprise: true },
        });

        if (user?.entreprise) {
          where.entrepriseId = user.entreprise.id;
        } else {
          // Si pas d'entreprise, filtrer par adminId (pour les particuliers)
          where.adminId = userId;
        }
      }

      const [appelsOffres, total] = await Promise.all([
        prisma.appelOffre.findMany({
          where,
          skip,
          take: limit,
          orderBy: { dateCreation: 'desc' },
          include: {
            _count: {
              select: { candidatures: true },
            },
          },
        }),
        prisma.appelOffre.count({ where }),
      ]);

      // Formater pour le frontend
      const formatted = appelsOffres.map((ao) => ({
        id: ao.id,
        title: ao.titre,
        description: ao.description,
        budget: ao.budget,
        city: ao.ville,
        sector: ao.secteur,
        status: ao.statutCompte.toLowerCase(),
        deadline: ao.dateLimite,
        createdAt: ao.dateCreation,
        candidatesCount: ao._count.candidatures,
      }));

      res.json({
        success: true,
        data: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/calls-for-tenders/statistics - Statistiques
  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as AuthUser | undefined)?.userId;

      // Construire le filtre
      const where: Prisma.AppelOffreWhereInput = {};
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { entreprise: true },
        });

        if (user?.entreprise) {
          where.entrepriseId = user.entreprise.id;
        } else {
          where.adminId = userId;
        }
      }

      const [total, published, closed, draft, totalCandidatures] = await Promise.all([
        prisma.appelOffre.count({ where }),
        prisma.appelOffre.count({ where: { ...where, statutCompte: AppelOffreStatus.PUBLIE } }),
        prisma.appelOffre.count({ where: { ...where, statutCompte: AppelOffreStatus.CLOTURE } }),
        prisma.appelOffre.count({ where: { ...where, statutCompte: AppelOffreStatus.BROUILLON } }),
        prisma.appelOffreCandidature.count({
          where: {
            appelOffre: where,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          total,
          published,
          closed,
          draft,
          totalCandidatures,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/calls-for-tenders/:id - Détail d'un appel d'offres
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;

      const appelOffre = await prisma.appelOffre.findUnique({
        where: { id: parseInt(id) },
        include: {
          candidatures: {
            include: {
              freelance: {
                select: { id: true, nom: true, prenom: true, metier: true },
              },
              entreprise: {
                select: { id: true, raisonSociale: true },
              },
            },
          },
          entreprise: {
            select: { id: true, raisonSociale: true },
          },
        },
      });

      if (!appelOffre) {
        res.status(404).json({
          success: false,
          message: "Appel d'offres non trouvé",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: appelOffre.id,
          title: appelOffre.titre,
          description: appelOffre.description,
          budget: appelOffre.budget,
          city: appelOffre.ville,
          sector: appelOffre.secteur,
          status: appelOffre.statutCompte.toLowerCase(),
          deadline: appelOffre.dateLimite,
          createdAt: appelOffre.dateCreation,
          candidatures: appelOffre.candidatures,
          entreprise: appelOffre.entreprise,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/calls-for-tenders - Créer un appel d'offres
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as AuthUser | undefined)?.userId;
      const { title, description, budget, city, sector, deadline } = req.body;

      // Récupérer l'entreprise de l'utilisateur si elle existe
      const user = userId
        ? await prisma.user.findUnique({
            where: { id: userId },
            include: { entreprise: true },
          })
        : null;

      const appelOffre = await prisma.appelOffre.create({
        data: {
          titre: title,
          description,
          budget,
          ville: city,
          secteur: sector,
          dateLimite: deadline ? new Date(deadline) : null,
          entrepriseId: user?.entreprise?.id || null,
          adminId: user?.entreprise ? null : userId,
          statutCompte: AppelOffreStatus.BROUILLON,
        },
      });

      res.status(201).json({
        success: true,
        message: "Appel d'offres créé avec succès",
        data: appelOffre,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/calls-for-tenders/:id - Modifier un appel d'offres
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { title, description, budget, city, sector, deadline, status } = req.body;

      const appelOffre = await prisma.appelOffre.update({
        where: { id: parseInt(id) },
        data: {
          titre: title,
          description,
          budget,
          ville: city,
          secteur: sector,
          dateLimite: deadline ? new Date(deadline) : undefined,
          statutCompte: status ? (status.toUpperCase() as AppelOffreStatus) : undefined,
        },
      });

      res.json({
        success: true,
        message: "Appel d'offres mis à jour",
        data: appelOffre,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/calls-for-tenders/:id - Supprimer un appel d'offres
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      await prisma.appelOffre.delete({
        where: { id: parseInt(id) },
      });

      res.json({
        success: true,
        message: "Appel d'offres supprimé",
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/calls-for-tenders/:id/publish - Publier un appel d'offres
  publish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const appelOffre = await prisma.appelOffre.update({
        where: { id: parseInt(id) },
        data: {
          statutCompte: AppelOffreStatus.PUBLIE,
        },
      });

      res.json({
        success: true,
        message: "Appel d'offres publié",
        data: appelOffre,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/calls-for-tenders/:id/close - Clôturer un appel d'offres
  close: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const appelOffre = await prisma.appelOffre.update({
        where: { id: parseInt(id) },
        data: {
          statutCompte: AppelOffreStatus.CLOTURE,
        },
      });

      res.json({
        success: true,
        message: "Appel d'offres clôturé",
        data: appelOffre,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default appelOffreController;
