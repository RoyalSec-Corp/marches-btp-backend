import { Response, NextFunction } from 'express';
import { paiementService } from '../services/paiement.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

class PaiementController {
  /**
   * GET /api/paiements/freelance
   * Récupérer les paiements du freelance connecté
   */
  async getFreelancePayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      // Récupérer le freelance associé à l'utilisateur
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const freelance = await prisma.freelance.findUnique({
        where: { userId },
      });

      if (!freelance) {
        // Si pas de freelance, retourner des données vides
        return res.json({
          success: true,
          data: {
            total: 0,
            platform: 0,
            cash: 0,
            wallet: 0,
            pending_commission_deductions: 0,
            history: [],
          },
        });
      }

      const payments = await paiementService.getFreelancePayments(freelance.id);
      
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/paiements/entreprise
   * Récupérer les paiements de l'entreprise connectée
   */
  async getEntreprisePayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const entreprise = await prisma.entreprise.findUnique({
        where: { userId },
      });

      if (!entreprise) {
        return res.json({
          success: true,
          data: {
            total: 0,
            paid: 0,
            pending: 0,
            history: [],
          },
        });
      }

      const payments = await paiementService.getEntreprisePayments(entreprise.id);
      
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/paiements/:id
   * Récupérer un paiement par ID
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const paiementId = parseInt(req.params.id);
      
      if (isNaN(paiementId)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const paiement = await paiementService.getById(paiementId);
      
      if (!paiement) {
        return res.status(404).json({ success: false, message: 'Paiement non trouvé' });
      }

      res.json({
        success: true,
        data: paiement,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/paiements/:id/validate
   * Valider un paiement
   */
  async validate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const paiementId = parseInt(req.params.id);
      
      if (isNaN(paiementId)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const paiement = await paiementService.validate(paiementId);
      
      res.json({
        success: true,
        data: paiement,
        message: 'Paiement validé',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paiementController = new PaiementController();
export default paiementController;
