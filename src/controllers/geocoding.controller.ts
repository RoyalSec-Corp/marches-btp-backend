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
        res.status(400).json({ error: "Au moins une information d'adresse est requise" });
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
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Géocodage par code postal
   * GET /api/geocoding/postal/:codePostal
   */
  async geocodeByPostalCode(req: Request, res: Response): Promise<void> {
    try {
      const { codePostal } = req.params;
      const { ville } = req.query;

      if (!codePostal) {
        res.status(400).json({ error: 'Code postal requis' });
        return;
      }

      const result = await geocodingService.geocodeByPostalCode(
        codePostal,
        ville as string | undefined
      );

      if (!result) {
        res.status(404).json({ error: 'Code postal non trouvé' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur géocodage par code postal:', error);
      res.status(500).json({
        error: 'Erreur lors du géocodage',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Géocodage inverse (coordonnées → adresse)
   * GET /api/geocoding/reverse
   */
  async reverseGeocode(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        res.status(400).json({ error: 'Latitude et longitude requises' });
        return;
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({ error: 'Coordonnées invalides' });
        return;
      }

      const result = await geocodingService.reverseGeocode(latitude, longitude);

      if (!result) {
        res.status(404).json({ error: 'Aucune adresse trouvée pour ces coordonnées' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
      res.status(500).json({
        error: 'Erreur lors du géocodage inverse',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Autocomplétion d'adresse
   * GET /api/geocoding/autocomplete
   */
  async autocomplete(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Paramètre de recherche requis (q)' });
        return;
      }

      if (q.length < 3) {
        res.status(400).json({ error: 'Minimum 3 caractères requis' });
        return;
      }

      const limitNum = limit ? parseInt(limit as string, 10) : 5;
      const results = await geocodingService.autocomplete(q, limitNum);

      res.status(200).json({ suggestions: results });
    } catch (error) {
      console.error('Erreur autocomplétion:', error);
      res.status(500).json({
        error: "Erreur lors de l'autocomplétion",
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Calculer la distance entre deux points
   * POST /api/geocoding/distance
   */
  async calculateDistance(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.body;

      if (!from || !to) {
        res.status(400).json({ error: "Points de départ (from) et d'arrivée (to) requis" });
        return;
      }

      if (
        typeof from.lat !== 'number' ||
        typeof from.lng !== 'number' ||
        typeof to.lat !== 'number' ||
        typeof to.lng !== 'number'
      ) {
        res.status(400).json({ error: 'Coordonnées invalides' });
        return;
      }

      const distance = geocodingService.calculateDistance(from.lat, from.lng, to.lat, to.lng);

      res.status(200).json({
        distance: Math.round(distance * 100) / 100, // Arrondi à 2 décimales
        unit: 'km',
        from,
        to,
      });
    } catch (error) {
      console.error('Erreur calcul distance:', error);
      res.status(500).json({
        error: 'Erreur lors du calcul de distance',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}

export const geocodingController = new GeocodingController();
export default geocodingController;
