import { Request, Response, NextFunction } from 'express';
import { entrepriseService } from '../services/entreprise.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

class EntrepriseController {
  /**
   * GET /api/entreprises/profile
   * Récupérer le profil de l'entreprise connectée
   */
  async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const entreprise = await entrepriseService.findByUserId(userId);
      if (!entreprise) {
        return res.status(404).json({ success: false, message: 'Profil entreprise non trouvé' });
      }

      res.json({
        success: true,
        data: entreprise,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/entreprises/profile
   * Mettre à jour le profil de l'entreprise connectée
   */
  async updateMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const {
        raisonSociale,
        siret,
        representantLegal,
        telephone,
        adresse,
        ville,
        codePostal,
        formeJuridique,
        siteWeb,
        description,
      } = req.body;

      const updated = await entrepriseService.updateProfile(userId, {
        raisonSociale,
        siret,
        representantLegal,
        telephone,
        adresse,
        ville,
        codePostal,
        formeJuridique,
        siteWeb,
        description,
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updated,
      });
    } catch (error: any) {
      if (error.message === 'Profil entreprise non trouvé') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('SIRET')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/entreprises
   * Lister toutes les entreprises (public, avec pagination)
   */
  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const ville = req.query.ville as string;
      const formeJuridique = req.query.formeJuridique as string;

      const result = await entrepriseService.findAll({ page, limit, ville, formeJuridique });

      res.json({
        success: true,
        data: result.entreprises,
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
   * GET /api/entreprises/:id
   * Récupérer une entreprise par son ID (public)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const entreprise = await entrepriseService.findById(id);

      if (!entreprise) {
        return res.status(404).json({ success: false, message: 'Entreprise non trouvée' });
      }

      res.json({
        success: true,
        data: entreprise,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/entreprises/siret/:siret
   * Récupérer une entreprise par son SIRET (public)
   */
  async getBySiret(req: Request, res: Response, next: NextFunction) {
    try {
      const { siret } = req.params;
      const entreprise = await entrepriseService.findBySiret(siret);

      if (!entreprise) {
        return res.status(404).json({ success: false, message: 'Entreprise non trouvée' });
      }

      res.json({
        success: true,
        data: entreprise,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/entreprises/search
   * Rechercher des entreprises
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'La recherche doit contenir au moins 2 caractères' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await entrepriseService.search(query.trim(), { page, limit });

      res.json({
        success: true,
        data: result.entreprises,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const entrepriseController = new EntrepriseController();
export default entrepriseController;
