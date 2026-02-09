import { Router } from 'express';
import { geocodingController } from '../controllers/geocoding.controller.js';

const router = Router();

// Routes publiques de géocodage (API gouvernementale française)

// Géocoder une adresse complète
router.post('/geocode', geocodingController.geocode);

// Géocodage inverse (coordonnées → adresse)
router.post('/reverse', geocodingController.reverseGeocode);

// Autocomplétion d'adresse (pour les formulaires)
router.get('/autocomplete', geocodingController.autocomplete);

// Calculer la distance entre deux points
router.post('/distance', geocodingController.calculateDistance);

// Recherche par code postal
router.get('/postal/:code', geocodingController.searchByPostalCode);

export default router;
