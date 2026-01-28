import { Router } from 'express';

const router = Router();

// GET /api/entreprises - Liste des entreprises
router.get('/', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'GET /api/entreprises'
  });
});

// GET /api/entreprises/:id - Détails d'une entreprise
router.get('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'GET /api/entreprises/:id'
  });
});

// POST /api/entreprises - Créer un profil entreprise
router.post('/', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'POST /api/entreprises'
  });
});

// PUT /api/entreprises/:id - Mettre à jour un profil entreprise
router.put('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 4',
    endpoint: 'PUT /api/entreprises/:id'
  });
});

export default router;
