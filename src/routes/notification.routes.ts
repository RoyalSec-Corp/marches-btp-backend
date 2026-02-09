import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// === Toutes les routes sont protégées ===

// GET /api/notifications/unread-count - Nombre de notifications non lues (AVANT /:id)
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// PUT /api/notifications/read-all - Marquer toutes comme lues (AVANT /:id)
router.put('/read-all', authenticate, notificationController.markAllAsRead);

// DELETE /api/notifications/read - Supprimer toutes les lues (AVANT /:id)
router.delete('/read', authenticate, notificationController.deleteAllRead);

// GET /api/notifications - Liste des notifications de l'utilisateur
router.get('/', authenticate, notificationController.list);

// GET /api/notifications/:id - Détails d'une notification
router.get('/:id', authenticate, notificationController.getById);

// PUT /api/notifications/:id/read - Marquer comme lue
router.put('/:id/read', authenticate, notificationController.markAsRead);

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', authenticate, notificationController.delete);

export default router;
