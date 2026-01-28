import { Router } from 'express';

const router = Router();

// GET /api/freelances - Liste des freelances
router.get('/', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'GET /api/freelances'
  });
});

// GET /api/freelances/:id - Détails d'un freelance
router.get('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'GET /api/freelances/:id'
  });
});

// POST /api/freelances - Créer un profil freelance
router.post('/', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'POST /api/freelances'
  });
});

// PUT /api/freelances/:id - Mettre à jour un profil freelance
router.put('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'PUT /api/freelances/:id'
  });
});

// GET /api/freelances/search - Recherche de freelances
router.get('/search', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'GET /api/freelances/search'
  });
});

export default router;
