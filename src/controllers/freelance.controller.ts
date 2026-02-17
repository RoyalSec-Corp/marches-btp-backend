import { Request, Response, NextFunction } from 'express';
import { freelanceService } from '../services/freelance.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

class FreelanceController {
  /**
   * GET /api/freelances/profile
   * Récupérer le profil du freelance connecté
   */
  async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const freelance = await freelanceService.findByUserId(userId);
      if (!freelance) {
        return res.status(404).json({ success: false, message: 'Profil freelance non trouvé' });
      }

      res.json({
        success: true,
        data: freelance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/freelances/profile
   * Mettre à jour le profil du freelance connecté
   */
  async updateMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const {
        nom,
        prenom,
        telephone,
        metier,
        tarif,
        siret,
        description,
        adresse,
        ville,
        codePostal,
        disponible,
        disponibilites,
        experienceYears,
      } = req.body;

      const updated = await freelanceService.updateProfile(userId, {
        nom,
        prenom,
        telephone,
        metier,
        tarif: tarif ? parseFloat(tarif) : undefined,
        siret,
        description,
        adresse,
        ville,
        codePostal,
        disponible,
        disponibilites,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updated,
      });
    } catch (error: any) {
      if (error.message === 'Profil freelance non trouvé') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * PATCH /api/freelances/disponibilite
   * Mettre à jour la disponibilité du freelance
   */
  async updateDisponibilite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const { disponible } = req.body;
      if (typeof disponible !== 'boolean') {
        return res
          .status(400)
          .json({ success: false, message: 'Le champ disponible doit être un booléen' });
      }

      const updated = await freelanceService.updateDisponibilite(userId, disponible);

      res.json({
        success: true,
        message: `Disponibilité mise à jour: ${disponible ? 'disponible' : 'indisponible'}`,
        data: { disponible: updated.disponible },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/freelances
   * Lister tous les freelances (public, avec pagination)
   */
  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const metier = req.query.metier as string;
      const ville = req.query.ville as string;
      const disponible =
        req.query.disponible === 'true'
          ? true
          : req.query.disponible === 'false'
            ? false
            : undefined;

      const result = await freelanceService.findAll({ page, limit, metier, ville, disponible });

      res.json({
        success: true,
        data: result.freelances,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/freelances/:id
   * Récupérer un freelance par son ID (public)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const freelance = await freelanceService.findById(id);

      if (!freelance) {
        return res.status(404).json({ success: false, message: 'Freelance non trouvé' });
      }

      res.json({
        success: true,
        data: freelance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/freelances/search
   * Rechercher des freelances
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res
          .status(400)
          .json({ success: false, message: 'La recherche doit contenir au moins 2 caractères' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await freelanceService.search(query.trim(), { page, limit });

      res.json({
        success: true,
        data: result.freelances,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const freelanceController = new FreelanceController();
export default freelanceController;
