import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    userType: string;
  };
}

class UploadController {
  /**
   * Upload documents freelance (photo, kbis, assurance, cv, certifications)
   * POST /api/freelances/documents
   */
  async uploadFreelanceDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      if (!files || Object.keys(files).length === 0) {
        res.status(400).json({ error: 'Aucun fichier fourni' });
        return;
      }

      // Traiter les fichiers uploadés
      const documents = uploadService.processUploadedFiles(files);

      // Mettre à jour les documents en base
      await uploadService.updateFreelanceDocuments(userId, documents);

      res.status(200).json({
        success: true,
        message: 'Documents uploadés avec succès',
        documents: Object.entries(documents).map(([type, doc]) => ({
          type,
          url: doc.url,
          originalName: doc.originalName,
          size: doc.size,
        })),
      });
    } catch (error) {
      console.error('Erreur upload documents freelance:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de l\'upload des documents',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Upload documents entreprise (logo, kbis, attestationAssurance)
   * POST /api/entreprises/documents
   */
  async uploadEntrepriseDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      if (!files || Object.keys(files).length === 0) {
        res.status(400).json({ error: 'Aucun fichier fourni' });
        return;
      }

      const documents = uploadService.processUploadedFiles(files);
      await uploadService.updateEntrepriseDocuments(userId, documents);

      res.status(200).json({
        success: true,
        message: 'Documents uploadés avec succès',
        documents: Object.entries(documents).map(([type, doc]) => ({
          type,
          url: doc.url,
          originalName: doc.originalName,
          size: doc.size,
        })),
      });
    } catch (error) {
      console.error('Erreur upload documents entreprise:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de l\'upload des documents',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Supprimer un document freelance
   * DELETE /api/freelances/documents/:type
   */
  async deleteFreelanceDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { type } = req.params;
      if (!type) {
        res.status(400).json({ error: 'Type de document requis' });
        return;
      }

      await uploadService.deleteFreelanceDocument(userId, type);

      res.status(200).json({
        success: true,
        message: `Document ${type} supprimé avec succès`,
      });
    } catch (error) {
      console.error('Erreur suppression document freelance:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la suppression du document',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Supprimer un document entreprise
   * DELETE /api/entreprises/documents/:type
   */
  async deleteEntrepriseDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { type } = req.params;
      if (!type) {
        res.status(400).json({ error: 'Type de document requis' });
        return;
      }

      await uploadService.deleteEntrepriseDocument(userId, type);

      res.status(200).json({
        success: true,
        message: `Document ${type} supprimé avec succès`,
      });
    } catch (error) {
      console.error('Erreur suppression document entreprise:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la suppression du document',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Récupérer les documents d'un freelance
   * GET /api/freelances/documents
   */
  async getFreelanceDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Non authentifié' });
        return;
      }

      const documents = await uploadService.getFreelanceDocuments(userId);

      res.status(200).json({ 
        success: true,
        documents 
      });
    } catch (error) {
      console.error('Erreur récupération documents freelance:', error);
      // Si freelance non trouvé, retourner documents vides au lieu d'erreur
      if (error instanceof Error && error.message.includes('non trouvé')) {
        res.status(200).json({ 
          success: true,
          documents: {
            photo: null,
            kbis: null,
            assurance: null,
            cv: null,
            certifications: null,
          }
        });
        return;
      }
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la récupération des documents',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Récupérer les documents d'une entreprise
   * GET /api/entreprises/documents
   */
  async getEntrepriseDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Non authentifié' });
        return;
      }

      const documents = await uploadService.getEntrepriseDocuments(userId);

      res.status(200).json({ 
        success: true,
        documents 
      });
    } catch (error) {
      console.error('Erreur récupération documents entreprise:', error);
      // Si entreprise non trouvée, retourner documents vides au lieu d'erreur
      if (error instanceof Error && error.message.includes('non trouvé')) {
        res.status(200).json({ 
          success: true,
          documents: {
            logo: null,
            kbis: null,
            assurance: null,
          }
        });
        return;
      }
      res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la récupération des documents',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}

export const uploadController = new UploadController();
export default uploadController;
