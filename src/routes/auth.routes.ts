import { Router } from 'express';

const router = Router();

// POST /api/auth/register - Inscription
router.post('/register', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 3',
    endpoint: 'POST /api/auth/register'
  });
});

// POST /api/auth/login - Connexion
router.post('/login', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 3',
    endpoint: 'POST /api/auth/login'
  });
});

// POST /api/auth/logout - Déconnexion
router.post('/logout', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 3',
    endpoint: 'POST /api/auth/logout'
  });
});

// POST /api/auth/refresh - Rafraîchir le token
router.post('/refresh', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 3',
    endpoint: 'POST /api/auth/refresh'
  });
});

// POST /api/auth/forgot-password - Mot de passe oublié
router.post('/forgot-password', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 3',
    endpoint: 'POST /api/auth/forgot-password'
  });
});

// POST /api/auth/reset-password - Réinitialiser le mot de passe
router.post('/reset-password', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 3',
    endpoint: 'POST /api/auth/reset-password'
  });
});

export default router;
