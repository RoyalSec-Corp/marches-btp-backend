import { Router } from 'express';
import { freelanceController } from '../controllers/freelance.controller.js';
import { authenticate, requireFreelance } from '../middlewares/auth.middleware.js';

const router = Router();

// Routes protégées (freelance connecté) - AVANT les routes avec paramètres
router.get('/profile', authenticate, requireFreelance, freelanceController.getMyProfile);
router.put('/profile', authenticate, requireFreelance, freelanceController.updateMyProfile);
router.patch(
  '/disponibilite',
  authenticate,
  requireFreelance,
  freelanceController.updateDisponibilite
);

// Routes publiques - ordre important: routes spécifiques AVANT /:id
router.get('/search', freelanceController.search);
router.get('/recommended', freelanceController.getRecommended);
router.get('/', freelanceController.listAll);
router.get('/:id', freelanceController.getById);

export default router;
