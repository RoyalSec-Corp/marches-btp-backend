import { Router } from 'express';

const router = Router();

// GET /api/users/me - Profil de l'utilisateur connecté
router.get('/me', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 3',
    endpoint: 'GET /api/users/me'
  });
});

// PUT /api/users/me - Mettre à jour le profil
router.put('/me', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'PUT /api/users/me'
  });
});

// GET /api/users/:id - Obtenir un utilisateur par ID
router.get('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'GET /api/users/:id'
  });
});

export default router;
