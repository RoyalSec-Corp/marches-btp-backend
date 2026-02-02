import { Router } from 'express';
import { entrepriseController } from '../controllers/entreprise.controller.js';
import { authenticate, requireEntreprise } from '../middlewares/auth.middleware.js';

const router = Router();

// Routes protégées (entreprise connectée) - AVANT les routes avec paramètres
router.get('/profile', authenticate, requireEntreprise, entrepriseController.getMyProfile);
router.put('/profile', authenticate, requireEntreprise, entrepriseController.updateMyProfile);

// Routes publiques
router.get('/search', entrepriseController.search);
router.get('/siret/:siret', entrepriseController.getBySiret);
router.get('/', entrepriseController.listAll);
router.get('/:id', entrepriseController.getById);

export default router;
