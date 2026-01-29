import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRegisterFreelance, validateRegisterEntreprise, validateLogin } from '../validators/auth.validator.js';

const router = Router();

/**
 * @route   POST /api/auth/register/freelance
 * @desc    Inscription d'un freelance
 * @access  Public
 */
router.post('/register/freelance', validateRegisterFreelance, authController.registerFreelance);

/**
 * @route   POST /api/auth/register/entreprise
 * @desc    Inscription d'une entreprise
 * @access  Public
 */
router.post('/register/entreprise', validateRegisterEntreprise, authController.registerEntreprise);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Deconnexion utilisateur
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraichir les tokens
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtenir le profil de l'utilisateur connecte
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   GET /api/auth/verify
 * @desc    Verifier si le token est valide
 * @access  Private
 */
router.get('/verify', authenticate, authController.verifyToken);

export default router;
