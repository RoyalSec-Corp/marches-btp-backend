import { Request, Response } from 'express';
import { contratService } from '../services/contrat.service.js';
import { ContratStatus } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    userType: string;
  };
}

class ContratController {
  /**
   * Créer un nouveau contrat
   * POST /api/contrats
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { titre, description, montant, entrepriseId, freelanceId, appelOffreId, dateDebut, dateFin } = req.body;

      if (!titre || !montant || !entrepriseId || !freelanceId) {
        res.status(400).json({ error: 'Champs requis: titre, montant, entrepriseId, freelanceId' });
        return;
      }

      const contrat = await contratService.create({
        titre,
        description,
        montant: parseFloat(montant),
        entrepriseId: parseInt(entrepriseId),
        freelanceId: parseInt(freelanceId),
        appelOffreId: appelOffreId ? parseInt(appelOffreId) : undefined,
        dateDebut: dateDebut ? new Date(dateDebut) : undefined,
        dateFin: dateFin ? new Date(dateFin) : undefined,
      }, userId);

      res.status(201).json({
        message: 'Contrat créé avec succès',
        contrat,
      });
    } catch (error) {
      console.error('Erreur création contrat:', error);
      res.status(500).json({
        error: 'Erreur lors de la création du contrat',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Récupérer un contrat par ID
   * GET /api/contrats/:id
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contrat = await contratService.findById(parseInt(id));
      res.status(200).json(contrat);
    } catch (error) {
      console.error('Erreur récupération contrat:', error);
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Contrat non trouvé',
      });
    }
  }

  /**
   * Lister tous les contrats (avec filtres)
   * GET /api/contrats
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', statut, entrepriseId, freelanceId, appelOffreId } = req.query;

      const filters: any = {};
      if (statut) filters.statut = statut as ContratStatus;
      if (entrepriseId) filters.entrepriseId = parseInt(entrepriseId as string);
      if (freelanceId) filters.freelanceId = parseInt(freelanceId as string);
      if (appelOffreId) filters.appelOffreId = parseInt(appelOffreId as string);

      const result = await contratService.list(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur liste contrats:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des contrats',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Lister mes contrats (utilisateur connecté)
   * GET /api/contrats/me
   */
  async listMyContrats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userType = req.user?.userType as 'FREELANCE' | 'ENTREPRISE';

      if (!userId || !userType) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      if (userType !== 'FREELANCE' && userType !== 'ENTREPRISE') {
        res.status(403).json({ error: 'Type d\'utilisateur non autorisé' });
        return;
      }

      const { page = '1', limit = '10' } = req.query;

      const result = await contratService.listByUser(
        userId,
        userType,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur liste mes contrats:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des contrats',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Mettre à jour un contrat
   * PUT /api/contrats/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { titre, description, montant, dateDebut, dateFin, progressStage } = req.body;

      const updateData: any = {};
      if (titre) updateData.titre = titre;
      if (description !== undefined) updateData.description = description;
      if (montant) updateData.montant = parseFloat(montant);
      if (dateDebut) updateData.dateDebut = new Date(dateDebut);
      if (dateFin) updateData.dateFin = new Date(dateFin);
      if (progressStage) updateData.progressStage = progressStage;

      const contrat = await contratService.update(parseInt(id), updateData);

      res.status(200).json({
        message: 'Contrat mis à jour avec succès',
        contrat,
      });
    } catch (error) {
      console.error('Erreur mise à jour contrat:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
      });
    }
  }

  /**
   * Envoyer pour signature
   * POST /api/contrats/:id/send
   */
  async sendForSignature(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contrat = await contratService.sendForSignature(parseInt(id));

      res.status(200).json({
        message: 'Contrat envoyé pour signature',
        contrat,
      });
    } catch (error) {
      console.error('Erreur envoi signature:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi',
      });
    }
  }

  /**
   * Signer un contrat
   * POST /api/contrats/:id/sign
   */
  async sign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { id } = req.params;
      const { signatureData } = req.body;

      if (!signatureData) {
        res.status(400).json({ error: 'Données de signature requises' });
        return;
      }

      const contrat = await contratService.sign(parseInt(id), userId, signatureData);

      res.status(200).json({
        message: contrat.bothPartiesSigned 
          ? 'Contrat signé par les deux parties' 
          : 'Signature enregistrée, en attente de l\'autre partie',
        contrat,
      });
    } catch (error) {
      console.error('Erreur signature contrat:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la signature',
      });
    }
  }

  /**
   * Démarrer un contrat
   * POST /api/contrats/:id/start
   */
  async start(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contrat = await contratService.start(parseInt(id));

      res.status(200).json({
        message: 'Contrat démarré',
        contrat,
      });
    } catch (error) {
      console.error('Erreur démarrage contrat:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors du démarrage',
      });
    }
  }

  /**
   * Terminer un contrat
   * POST /api/contrats/:id/complete
   */
  async complete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contrat = await contratService.complete(parseInt(id));

      res.status(200).json({
        message: 'Contrat terminé',
        contrat,
      });
    } catch (error) {
      console.error('Erreur terminaison contrat:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la terminaison',
      });
    }
  }

  /**
   * Annuler un contrat
   * DELETE /api/contrats/:id
   */
  async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const contrat = await contratService.cancel(parseInt(id), reason);

      res.status(200).json({
        message: 'Contrat annulé',
        contrat,
      });
    } catch (error) {
      console.error('Erreur annulation contrat:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de l\'annulation',
      });
    }
  }

  /**
   * Obtenir les statistiques
   * GET /api/contrats/stats
   */
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userType = req.user?.userType as 'FREELANCE' | 'ENTREPRISE' | undefined;

      const stats = await contratService.getStats(
        userId,
        userType === 'FREELANCE' || userType === 'ENTREPRISE' ? userType : undefined
      );

      res.status(200).json(stats);
    } catch (error) {
      console.error('Erreur statistiques contrats:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des statistiques',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}

export const contratController = new ContratController();
export default contratController;
