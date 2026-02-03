import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const adminController = {
  // GET /api/admin/users - Liste tous les utilisateurs
  getAllUsers: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          userType: true,
          telephone: true,
          ville: true,
          isActive: true,
          createdAt: true,
          freelance: {
            select: {
              id: true,
              metier: true,
              tarif: true,
              statutCompte: true,
            },
          },
          entreprise: {
            select: {
              id: true,
              raisonSociale: true,
              siret: true,
              statutCompte: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transformer pour le frontend
      const formattedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        user_type: user.userType.toLowerCase(),
        telephone: user.telephone,
        ville: user.ville,
        is_active: user.isActive,
        created_at: user.createdAt,
        nom_entreprise: user.entreprise?.raisonSociale || null,
        metier: user.freelance?.metier || null,
        statut_compte: user.freelance?.statutCompte || user.entreprise?.statutCompte || null,
      }));

      res.json(formattedUsers);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/user-search - Recherche d'utilisateurs
  searchUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req.query.q as string) || '';

      if (query.length < 2) {
        res.json([]);
        return;
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { nom: { contains: query, mode: 'insensitive' } },
            { prenom: { contains: query, mode: 'insensitive' } },
            { entreprise: { raisonSociale: { contains: query, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          userType: true,
          ville: true,
          createdAt: true,
          entreprise: {
            select: { raisonSociale: true },
          },
        },
        take: 20,
      });

      const formattedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        user_type: user.userType.toLowerCase(),
        ville: user.ville,
        created_at: user.createdAt,
        nom_entreprise: user.entreprise?.raisonSociale || null,
      }));

      res.json(formattedUsers);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/users/:id - Obtenir un utilisateur par ID
  getUserById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          freelance: true,
          entreprise: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        user_type: user.userType.toLowerCase(),
        telephone: user.telephone,
        ville: user.ville,
        is_active: user.isActive,
        created_at: user.createdAt,
        nom_entreprise: user.entreprise?.raisonSociale || null,
        freelance: user.freelance,
        entreprise: user.entreprise,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/admin/users/:id - Mettre à jour un utilisateur
  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { nom, prenom, email, nom_entreprise } = req.body;

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          nom,
          prenom,
          email,
        },
      });

      // Si c'est une entreprise, mettre à jour la raison sociale
      if (nom_entreprise) {
        await prisma.entreprise.updateMany({
          where: { userId: parseInt(id) },
          data: { raisonSociale: nom_entreprise },
        });
      }

      res.json({
        success: true,
        message: 'Utilisateur mis à jour',
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/admin/users/:id - Supprimer un utilisateur
  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = parseInt(id);

      // Supprimer le freelance ou l'entreprise associé d'abord
      await prisma.freelance.deleteMany({ where: { userId } });
      await prisma.entreprise.deleteMany({ where: { userId } });
      await prisma.session.deleteMany({ where: { userId } });

      // Supprimer l'utilisateur
      await prisma.user.delete({
        where: { id: userId },
      });

      res.json({
        success: true,
        message: 'Utilisateur supprimé',
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/users/:id/activity - Activité d'un utilisateur
  getUserActivity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = parseInt(id);

      // Récupérer les contrats
      const contrats = await prisma.contrat.findMany({
        where: {
          OR: [{ freelanceId: userId }, { entrepriseId: userId }],
        },
        select: {
          id: true,
          titre: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      // Récupérer les candidatures (si freelance)
      const candidatures = await prisma.appelOffreCandidature.findMany({
        where: { freelanceId: userId },
        select: {
          id: true,
          datePostulation: true,
          appelOffre: {
            select: { titre: true },
          },
        },
        take: 10,
        orderBy: { datePostulation: 'desc' },
      });

      interface ActivityItem {
        type: string;
        label: string;
        date: Date;
      }

      const activity: ActivityItem[] = [
        ...contrats.map((c) => ({
          type: 'contrat',
          label: c.titre || `Contrat #${c.id}`,
          date: c.createdAt,
        })),
        ...candidatures.map((c) => ({
          type: 'candidature',
          label: c.appelOffre?.titre || `Candidature #${c.id}`,
          date: c.datePostulation,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json(activity);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/stats - Statistiques globales
  getStats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [totalUsers, totalFreelances, totalEntreprises, totalContrats] = await Promise.all([
        prisma.user.count(),
        prisma.freelance.count(),
        prisma.entreprise.count(),
        prisma.contrat.count(),
      ]);

      // Format attendu par le frontend
      res.json({
        counts: {
          total: totalUsers,
          freelances: totalFreelances,
          entreprises: totalEntreprises,
        },
        totalContrats,
        activity: [], // Données pour le graphique d'inscriptions
        revenue: [], // Données pour le graphique de revenus
        users: [], // Liste des derniers utilisateurs pour le widget
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/map-data - Données pour la carte
  getMapData: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Récupérer les freelances avec leurs infos depuis User (qui a la ville)
      const freelances = await prisma.freelance.findMany({
        select: {
          id: true,
          nom: true,
          prenom: true,
          user: {
            select: {
              ville: true,
            },
          },
        },
        take: 100,
      });

      // Récupérer les entreprises
      const entreprises = await prisma.entreprise.findMany({
        select: {
          id: true,
          raisonSociale: true,
          ville: true,
        },
        take: 100,
      });

      // Note: Sans coordonnées GPS, on retourne des tableaux vides pour la carte
      // La carte nécessiterait un service de géocodage pour convertir les villes en lat/lng
      res.json({
        freelances: freelances
          .filter((f) => f.user?.ville)
          .map((f) => ({
            id: f.id,
            title: `${f.prenom} ${f.nom}`,
            ville: f.user?.ville,
            lat: 46.603354, // Centre de la France par défaut
            lng: 1.888334,
          })),
        entreprises: entreprises
          .filter((e) => e.ville)
          .map((e) => ({
            id: e.id,
            title: e.raisonSociale,
            ville: e.ville,
            lat: 46.603354,
            lng: 1.888334,
          })),
        offres: [],
      });
    } catch (error) {
      next(error);
    }
  },
};

export default adminController;
