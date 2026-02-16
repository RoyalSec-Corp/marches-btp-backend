import { Router } from 'express';
import { paiementController } from '../controllers/paiement.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// === Toutes les routes sont protégées ===

// GET /api/paiements/freelance - Paiements du freelance connecté
router.get('/freelance', authenticate, paiementController.getFreelancePayments);

// GET /api/paiements/entreprise - Paiements de l'entreprise connectée
router.get('/entreprise', authenticate, paiementController.getEntreprisePayments);

// GET /api/paiements/:id - Détails d'un paiement
router.get('/:id', authenticate, paiementController.getById);

// POST /api/paiements/:id/validate - Valider un paiement
router.post('/:id/validate', authenticate, paiementController.validate);

export default router;
