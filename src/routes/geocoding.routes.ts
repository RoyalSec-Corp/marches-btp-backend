import { Router } from 'express';
import { geocodingController } from '../controllers/geocoding.controller.js';

const router = Router();

// Routes publiques de géocodage (API gouvernementale gratuite)

// POST /api/geocoding/geocode - Géocoder une adresse complète
router.post('/geocode', geocodingController.geocode);

// GET /api/geocoding/postal/:codePostal - Géocoder par code postal
router.get('/postal/:codePostal', geocodingController.geocodeByPostalCode);

// GET /api/geocoding/reverse?lat=...&lng=... - Géocodage inverse
router.get('/reverse', geocodingController.reverseGeocode);

// GET /api/geocoding/autocomplete?q=... - Autocomplétion d'adresse
router.get('/autocomplete', geocodingController.autocomplete);

// POST /api/geocoding/distance - Calculer distance entre deux points
router.post('/distance', geocodingController.calculateDistance);

export default router;
