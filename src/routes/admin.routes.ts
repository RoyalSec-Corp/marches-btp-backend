import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Toutes les routes admin nécessitent une authentification
// TODO: Ajouter un middleware pour vérifier le rôle ADMIN

/**
 * @route   GET /api/admin/stats
 * @desc    Statistiques globales
 * @access  Admin
 */
router.get('/stats', authenticate, adminController.getStats);

/**
 * @route   GET /api/admin/map-data
 * @desc    Données pour la carte interactive
 * @access  Admin
 */
router.get('/map-data', authenticate, adminController.getMapData);

/**
 * @route   GET /api/admin/users
 * @desc    Liste tous les utilisateurs
 * @access  Admin
 */
router.get('/users', authenticate, adminController.getAllUsers);

/**
 * @route   GET /api/admin/user-search
 * @desc    Recherche d'utilisateurs
 * @access  Admin
 */
router.get('/user-search', authenticate, adminController.searchUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Obtenir un utilisateur par ID
 * @access  Admin
 */
router.get('/users/:id', authenticate, adminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Admin
 */
router.put('/users/:id', authenticate, adminController.updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Admin
 */
router.delete('/users/:id', authenticate, adminController.deleteUser);

/**
 * @route   GET /api/admin/users/:id/activity
 * @desc    Activité d'un utilisateur
 * @access  Admin
 */
router.get('/users/:id/activity', authenticate, adminController.getUserActivity);

export default router;
