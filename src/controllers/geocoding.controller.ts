import { Request, Response } from 'express';
import { geocodingService } from '../services/geocoding.service.js';

class GeocodingController {
  /**
   * Géocoder une adresse
   * POST /api/geocoding/geocode
   */
  async geocode(req: Request, res: Response): Promise<void> {
    try {
      const { adresse, ville, codePostal, pays } = req.body;

      if (!adresse && !ville && !codePostal) {
        res.status(400).json({ error: 'Au moins une information d\'adresse est requise' });
        return;
      }

      const result = await geocodingService.geocodeAddress({
        adresse,
        ville,
        codePostal,
        pays,
      });

      if (!result) {
        res.status(404).json({ error: 'Adresse non trouvée' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur géocodage:', error);
      res.status(500).json({ 
        error: 'Erreur lors du géocodage',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Géocodage inverse (coordonnées → adresse)
   * POST /api/geocoding/reverse
   */
  async reverseGeocode(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        res.status(400).json({ error: 'Latitude et longitude sont requis' });
        return;
      }

      const result = await geocodingService.reverseGeocode(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      if (!result) {
        res.status(404).json({ error: 'Aucune adresse trouvée pour ces coordonnées' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
      res.status(500).json({ 
        error: 'Erreur lors du géocodage inverse',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Autocomplétion d'adresse
   * GET /api/geocoding/autocomplete?q=query
   */
  async autocomplete(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Paramètre q (query) requis' });
        return;
      }

      const results = await geocodingService.autocomplete(
        q,
        limit ? parseInt(limit as string, 10) : 5
      );

      res.status(200).json({ suggestions: results });
    } catch (error) {
      console.error('Erreur autocomplétion:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'autocomplétion',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Calculer la distance entre deux points
   * POST /api/geocoding/distance
   */
  async calculateDistance(req: Request, res: Response): Promise<void> {
    try {
      const { lat1, lon1, lat2, lon2 } = req.body;

      if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
        res.status(400).json({ error: 'Les 4 coordonnées sont requises (lat1, lon1, lat2, lon2)' });
        return;
      }

      const distance = geocodingService.calculateDistance(
        parseFloat(lat1),
        parseFloat(lon1),
        parseFloat(lat2),
        parseFloat(lon2)
      );

      res.status(200).json({
        distance: Math.round(distance * 100) / 100, // Arrondi à 2 décimales
        unit: 'km',
      });
    } catch (error) {
      console.error('Erreur calcul distance:', error);
      res.status(500).json({ 
        error: 'Erreur lors du calcul de distance',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Recherche par code postal
   * GET /api/geocoding/postal/:code
   */
  async searchByPostalCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const { ville } = req.query;

      if (!code) {
        res.status(400).json({ error: 'Code postal requis' });
        return;
      }

      const result = await geocodingService.geocodeByPostalCode(
        code,
        ville as string | undefined
      );

      if (!result) {
        res.status(404).json({ error: 'Code postal non trouvé' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur recherche code postal:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la recherche',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}

export const geocodingController = new GeocodingController();
export default geocodingController;
