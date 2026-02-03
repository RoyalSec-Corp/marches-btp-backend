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
        experience,
        diplome,
        certifications,
        specialites,
        disponible,
        mobilite,
      } = req.body;

      const updateData: Record<string, unknown> = {};
      if (nom !== undefined) {
        updateData.nom = nom;
      }
      if (prenom !== undefined) {
        updateData.prenom = prenom;
      }
      if (telephone !== undefined) {
        updateData.telephone = telephone;
      }
      if (metier !== undefined) {
        updateData.metier = metier;
      }
      if (tarif !== undefined) {
        updateData.tarif = parseFloat(tarif);
      }
      if (siret !== undefined) {
        updateData.siret = siret;
      }
      if (description !== undefined) {
        updateData.description = description;
      }
      if (adresse !== undefined) {
        updateData.adresse = adresse;
      }
      if (ville !== undefined) {
        updateData.ville = ville;
      }
      if (codePostal !== undefined) {
        updateData.codePostal = codePostal;
      }
      if (experience !== undefined) {
        updateData.experience = parseInt(experience, 10);
      }
      if (diplome !== undefined) {
        updateData.diplome = diplome;
      }
      if (certifications !== undefined) {
        updateData.certifications = certifications;
      }
      if (specialites !== undefined) {
        updateData.specialites = specialites;
      }
      if (disponible !== undefined) {
        updateData.disponible = disponible;
      }
      if (mobilite !== undefined) {
        updateData.mobilite = parseInt(mobilite, 10);
      }

      const freelance = await freelanceService.updateByUserId(userId, updateData);
      if (!freelance) {
        return res.status(404).json({ success: false, message: 'Profil freelance non trouvé' });
      }

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: freelance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/freelances/disponibilite
   * Mettre à jour la disponibilité du freelance connecté
   */
  async updateDisponibilite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const { disponible } = req.body;
      if (disponible === undefined) {
        return res.status(400).json({ success: false, message: 'Disponibilité requise' });
      }

      const freelance = await freelanceService.updateDisponibilite(userId, Boolean(disponible));
      if (!freelance) {
        return res.status(404).json({ success: false, message: 'Profil freelance non trouvé' });
      }

      res.json({
        success: true,
        message: 'Disponibilité mise à jour avec succès',
        data: freelance,
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
      const limit = parseInt(req.query.limit as string) || 10;
      const metier = req.query.metier as string | undefined;
      const ville = req.query.ville as string | undefined;
      const disponibleParam = req.query.disponible as string | undefined;

      // Convertir en boolean si fourni
      let disponible: boolean | undefined;
      if (disponibleParam !== undefined) {
        disponible = disponibleParam === 'true';
      }

      const { freelances, total } = await freelanceService.findAll({
        page,
        limit,
        metier,
        ville,
        disponible,
      });

      res.json({
        success: true,
        data: freelances,
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
  }

  /**
   * GET /api/freelances/recommended
   * Récupérer les freelances recommandés (public)
   */
  async getRecommended(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const freelances = await freelanceService.findRecommended(limit);

      res.json({
        success: true,
        data: freelances,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/freelances/search
   * Rechercher des freelances (public)
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(400).json({ success: false, message: 'Paramètre de recherche requis' });
      }

      const { freelances, total } = await freelanceService.search(query, { page, limit });

      res.json({
        success: true,
        data: freelances,
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
  }

  /**
   * GET /api/freelances/:id
   * Récupérer un freelance par son ID (public)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      // Vérifier que l'ID est un nombre valide
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

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
}

export const freelanceController = new FreelanceController();
