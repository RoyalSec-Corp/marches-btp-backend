import { Router } from 'express';
import { appelOffreController } from '../controllers/appel-offre.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/calls-for-tenders/statistics
 * @desc    Statistiques des appels d'offres
 * @access  Private
 */
router.get('/statistics', authenticate, appelOffreController.getStatistics);

/**
 * @route   GET /api/calls-for-tenders
 * @desc    Liste des appels d'offres
 * @access  Private
 */
router.get('/', authenticate, appelOffreController.getAll);

/**
 * @route   GET /api/calls-for-tenders/:id
 * @desc    Détail d'un appel d'offres
 * @access  Private
 */
router.get('/:id', authenticate, appelOffreController.getById);

/**
 * @route   POST /api/calls-for-tenders
 * @desc    Créer un appel d'offres
 * @access  Private
 */
router.post('/', authenticate, appelOffreController.create);

/**
 * @route   PUT /api/calls-for-tenders/:id
 * @desc    Modifier un appel d'offres
 * @access  Private
 */
router.put('/:id', authenticate, appelOffreController.update);

/**
 * @route   DELETE /api/calls-for-tenders/:id
 * @desc    Supprimer un appel d'offres
 * @access  Private
 */
router.delete('/:id', authenticate, appelOffreController.delete);

/**
 * @route   PUT /api/calls-for-tenders/:id/publish
 * @desc    Publier un appel d'offres
 * @access  Private
 */
router.put('/:id/publish', authenticate, appelOffreController.publish);

/**
 * @route   PUT /api/calls-for-tenders/:id/close
 * @desc    Clôturer un appel d'offres
 * @access  Private
 */
router.put('/:id/close', authenticate, appelOffreController.close);

export default router;
