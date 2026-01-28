import { Router } from 'express';

const router = Router();

// GET /api/notifications - Liste des notifications de l'utilisateur
router.get('/', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 6',
    endpoint: 'GET /api/notifications'
  });
});

// GET /api/notifications/unread-count - Nombre de notifications non lues
router.get('/unread-count', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 6',
    endpoint: 'GET /api/notifications/unread-count'
  });
});

// PUT /api/notifications/:id/read - Marquer comme lue
router.put('/:id/read', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 6',
    endpoint: 'PUT /api/notifications/:id/read'
  });
});

// PUT /api/notifications/read-all - Marquer toutes comme lues
router.put('/read-all', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 6',
    endpoint: 'PUT /api/notifications/read-all'
  });
});

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', (_req, res) => {
  res.status(501).json({ 
    message: 'Route à implémenter - Sprint 6',
    endpoint: 'DELETE /api/notifications/:id'
  });
});

export default router;
