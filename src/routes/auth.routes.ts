import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  loginSchema,
  registerFreelanceSchema,
  registerEntrepriseSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation.js';

const router = Router();

// ===== ROUTES PUBLIQUES =====

// POST /api/auth/login - Connexion
router.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController)
);

// POST /api/auth/register/freelance - Inscription Freelance
router.post(
  '/register/freelance',
  validate(registerFreelanceSchema),
  authController.registerFreelance.bind(authController)
);

// POST /api/auth/register/entreprise - Inscription Entreprise
router.post(
  '/register/entreprise',
  validate(registerEntrepriseSchema),
  authController.registerEntreprise.bind(authController)
);

// POST /api/auth/refresh - Rafraichir le token
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

// POST /api/auth/forgot-password - Mot de passe oublie
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

// POST /api/auth/reset-password - Reinitialiser le mot de passe
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

// ===== ROUTES PROTEGEES =====

// POST /api/auth/logout - Deconnexion
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

// GET /api/auth/profile - Profil utilisateur
router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

// GET /api/auth/verify - Verifier le token
router.get(
  '/verify',
  authenticate,
  authController.verifyToken.bind(authController)
);

export default router;
