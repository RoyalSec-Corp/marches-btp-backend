import { Router } from 'express';

const router = Router();

// GET /api/contrats - Liste des contrats
router.get('/', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 5',
    endpoint: 'GET /api/contrats'
  });
});

// GET /api/contrats/:id - Détails d'un contrat
router.get('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 5',
    endpoint: 'GET /api/contrats/:id'
  });
});

// POST /api/contrats - Créer un contrat
router.post('/', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 5',
    endpoint: 'POST /api/contrats'
  });
});

// PUT /api/contrats/:id - Mettre à jour un contrat
router.put('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 5',
    endpoint: 'PUT /api/contrats/:id'
  });
});

// POST /api/contrats/:id/sign - Signer un contrat
router.post('/:id/sign', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 5',
    endpoint: 'POST /api/contrats/:id/sign'
  });
});

// DELETE /api/contrats/:id - Annuler un contrat
router.delete('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 5',
    endpoint: 'DELETE /api/contrats/:id'
  });
});

export default router;
