import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    typeUtilisateur: string;
  };
}

class NotificationController {
  /**
   * Récupérer mes notifications
   * GET /api/notifications
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { page = '1', limit = '20' } = req.query;

      const result = await notificationService.listByUser(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur liste notifications:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des notifications',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Compter les notifications non lues
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({ unreadCount: count });
    } catch (error) {
      console.error('Erreur comptage notifications:', error);
      res.status(500).json({
        error: 'Erreur lors du comptage des notifications',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Récupérer une notification par ID
   * GET /api/notifications/:id
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { id } = req.params;
      const notification = await notificationService.findById(parseInt(id));

      // Vérifier que la notification appartient à l'utilisateur
      if (notification.destinataireId !== userId) {
        res.status(403).json({ error: 'Accès non autorisé' });
        return;
      }

      res.status(200).json(notification);
    } catch (error) {
      console.error('Erreur récupération notification:', error);
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Notification non trouvée',
      });
    }
  }

  /**
   * Marquer une notification comme lue
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { id } = req.params;
      const notification = await notificationService.markAsRead(parseInt(id), userId);

      res.status(200).json({
        message: 'Notification marquée comme lue',
        notification,
      });
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors du marquage',
      });
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   * PUT /api/notifications/read-all
   */
  async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const count = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        message: `${count} notification(s) marquée(s) comme lue(s)`,
        count,
      });
    } catch (error) {
      console.error('Erreur marquage notifications:', error);
      res.status(500).json({
        error: 'Erreur lors du marquage des notifications',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Supprimer une notification
   * DELETE /api/notifications/:id
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { id } = req.params;
      await notificationService.delete(parseInt(id), userId);

      res.status(200).json({
        message: 'Notification supprimée',
      });
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
      });
    }
  }

  /**
   * Supprimer toutes les notifications lues
   * DELETE /api/notifications/read
   */
  async deleteAllRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const count = await notificationService.deleteAllRead(userId);

      res.status(200).json({
        message: `${count} notification(s) lue(s) supprimée(s)`,
        count,
      });
    } catch (error) {
      console.error('Erreur suppression notifications:', error);
      res.status(500).json({
        error: 'Erreur lors de la suppression des notifications',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}

export const notificationController = new NotificationController();
export default notificationController;
