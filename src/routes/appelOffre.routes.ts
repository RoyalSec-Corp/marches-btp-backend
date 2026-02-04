import { Router } from 'express';
import { appelOffreController } from '../controllers/appelOffre.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// ===== Routes publiques / auth optionnel =====

// GET /api/calls-for-tenders/statistics - Statistiques (auth requise)
router.get('/statistics', authenticate, (req, res, next) => appelOffreController.getStatistics(req, res, next));

// GET /api/calls-for-tenders - Lister les AO (auth optionnel pour publisher_only)
router.get('/', optionalAuth, (req, res, next) => appelOffreController.list(req, res, next));

// GET /api/calls-for-tenders/:id - Détail d'un AO
router.get('/:id', optionalAuth, (req, res, next) => appelOffreController.getById(req, res, next));

// ===== Routes authentifiées =====

// POST /api/calls-for-tenders - Créer un AO
router.post('/', authenticate, (req, res, next) => appelOffreController.create(req, res, next));

// POST /api/calls-for-tenders/:id/apply - Postuler
router.post('/:id/apply', authenticate, (req, res, next) => appelOffreController.apply(req, res, next));

// GET /api/calls-for-tenders/:id/applications - Lister candidatures
router.get('/:id/applications', authenticate, (req, res, next) => appelOffreController.listApplications(req, res, next));

// PUT /api/calls-for-tenders/:id/applications/:applicationId/accept
router.put('/:id/applications/:applicationId/accept', authenticate, (req, res, next) => appelOffreController.acceptApplication(req, res, next));

// PUT /api/calls-for-tenders/:id/applications/:applicationId/reject
router.put('/:id/applications/:applicationId/reject', authenticate, (req, res, next) => appelOffreController.rejectApplication(req, res, next));

export default router;
