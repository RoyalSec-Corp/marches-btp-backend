import { Request, Response, NextFunction } from 'express';
import { appelOffreService } from '../services/appelOffre.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

class AppelOffreController {
  /**
   * POST /api/calls-for-tenders
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const { titre, description, budget, ville, typeConstruction, secteur, cible, dateLimite, typePersonne } = req.body;

      if (!titre) {
        return res.status(400).json({ success: false, message: 'Le titre est requis' });
      }

      const appelOffre = await appelOffreService.create(userId, {
        titre,
        description,
        budget,
        ville,
        typeConstruction,
        secteur,
        cible,
        dateLimite,
        typePersonne,
      });

      res.status(201).json({ success: true, data: appelOffre });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/calls-for-tenders
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const localisation = req.query.localisation as string;
      const type_construction = req.query.type_construction as string;
      const budget_min = req.query.budget_min ? parseFloat(req.query.budget_min as string) : undefined;
      const budget_max = req.query.budget_max ? parseFloat(req.query.budget_max as string) : undefined;
      const publisher_only = req.query.publisher_only === 'true';

      let mots_cles: string[] | undefined;
      if (req.query.mots_cles) {
        mots_cles = Array.isArray(req.query.mots_cles)
          ? req.query.mots_cles as string[]
          : [req.query.mots_cles as string];
      }

      const result = await appelOffreService.findAll({
        page,
        limit,
        localisation,
        type_construction,
        budget_min,
        budget_max,
        mots_cles,
        publisher_only,
        userId: req.user?.id,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/calls-for-tenders/statistics
   */
  async getStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await appelOffreService.getStatistics(req.user?.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/calls-for-tenders/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const appel = await appelOffreService.findById(id);
      if (!appel) {
        return res.status(404).json({ success: false, message: 'Appel d\'offre non trouvé' });
      }

      res.json({ success: true, data: appel });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/calls-for-tenders/:id/apply
   */
  async apply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const appelOffreId = parseInt(req.params.id);
      if (isNaN(appelOffreId)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const { proposition, budgetPropose, dureeProposee, typeCandidat } = req.body;

      const candidature = await appelOffreService.apply(appelOffreId, userId, {
        proposition,
        budgetPropose: budgetPropose ? parseFloat(budgetPropose) : undefined,
        dureeProposee,
        typeCandidat: typeCandidat || 'FREELANCE',
      });

      res.status(201).json({ success: true, data: candidature });
    } catch (error: any) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ success: false, message: 'Vous avez déjà postulé à cet appel d\'offre' });
      }
      next(error);
    }
  }

  /**
   * GET /api/calls-for-tenders/:id/applications
   */
  async listApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const appelOffreId = parseInt(req.params.id);
      if (isNaN(appelOffreId)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const applications = await appelOffreService.listApplications(appelOffreId);
      res.json({ success: true, data: applications });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/calls-for-tenders/:id/applications/:applicationId/accept
   */
  async acceptApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const appelOffreId = parseInt(req.params.id);
      const applicationId = parseInt(req.params.applicationId);

      const result = await appelOffreService.acceptApplication(appelOffreId, applicationId);
      res.json({ success: true, data: result, message: 'Candidature acceptée' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/calls-for-tenders/:id/applications/:applicationId/reject
   */
  async rejectApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const appelOffreId = parseInt(req.params.id);
      const applicationId = parseInt(req.params.applicationId);

      const result = await appelOffreService.rejectApplication(appelOffreId, applicationId);
      res.json({ success: true, data: result, message: 'Candidature refusée' });
    } catch (error) {
      next(error);
    }
  }
}

export const appelOffreController = new AppelOffreController();
export default appelOffreController;
