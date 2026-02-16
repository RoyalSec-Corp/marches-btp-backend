import { Router } from 'express';
import { contratController } from '../controllers/contrat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// === Routes protégées ===

// GET /api/contrats/stats - Statistiques (avant :id pour éviter conflit)
router.get('/stats', authenticate, contratController.getStats);

// GET /api/contrats/me - Mes contrats
router.get('/me', authenticate, contratController.listMyContrats);

// GET /api/contrats - Liste tous les contrats (admin ou filtres)
router.get('/', authenticate, contratController.list);

// GET /api/contrats/:id - Détails d'un contrat
router.get('/:id', authenticate, contratController.getById);

// POST /api/contrats - Créer un contrat
router.post('/', authenticate, contratController.create);

// PUT /api/contrats/:id - Mettre à jour un contrat
router.put('/:id', authenticate, contratController.update);

// POST /api/contrats/:id/send - Envoyer pour signature
router.post('/:id/send', authenticate, contratController.sendForSignature);

// POST /api/contrats/:id/sign - Signer un contrat
router.post('/:id/sign', authenticate, contratController.sign);

// POST /api/contrats/:id/start - Démarrer un contrat
router.post('/:id/start', authenticate, contratController.start);

// POST /api/contrats/:id/complete - Terminer un contrat
router.post('/:id/complete', authenticate, contratController.complete);

// DELETE /api/contrats/:id - Annuler un contrat
router.delete('/:id', authenticate, contratController.cancel);

export default router;
