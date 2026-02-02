import { Router } from 'express';
import { freelanceController } from '../controllers/freelance.controller.js';
import { authenticate, requireFreelance } from '../middlewares/auth.middleware.js';

const router = Router();

// Routes publiques
router.get('/search', freelanceController.search);
router.get('/', freelanceController.listAll);
router.get('/:id', freelanceController.getById);

// Routes protégées (freelance connecté)
router.get('/profile', authenticate, requireFreelance, freelanceController.getMyProfile);
router.put('/profile', authenticate, requireFreelance, freelanceController.updateMyProfile);
router.patch('/disponibilite', authenticate, requireFreelance, freelanceController.updateDisponibilite);

export default router;
