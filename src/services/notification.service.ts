import { PrismaClient, NotificationType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationInput {
  destinataireId: number;
  destinataireType: string;
  typeNotification: NotificationType;
  titre?: string;
  message: string;
  contratId?: number;
}

export interface NotificationFilters {
  destinataireId?: number;
  typeNotification?: NotificationType;
  lu?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

class NotificationService {
  /**
   * Créer une notification
   */
  async create(data: CreateNotificationInput): Promise<any> {
    return prisma.notification.create({
      data: {
        destinataireId: data.destinataireId,
        destinataireType: data.destinataireType,
        typeNotification: data.typeNotification,
        titre: data.titre,
        message: data.message,
        contratId: data.contratId,
      },
      include: {
        contrat: true,
      },
    });
  }

  /**
   * Créer plusieurs notifications (bulk)
   */
  async createMany(notifications: CreateNotificationInput[]): Promise<number> {
    const result = await prisma.notification.createMany({
      data: notifications.map(n => ({
        destinataireId: n.destinataireId,
        destinataireType: n.destinataireType,
        typeNotification: n.typeNotification,
        titre: n.titre,
        message: n.message,
        contratId: n.contratId,
      })),
    });
    return result.count;
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  async listByUser(userId: number, page: number = 1, limit: number = 20): Promise<{
    data: any[];
    total: number;
    unreadCount: number;
    page: number;
    totalPages: number;
  }> {
    const where: Prisma.NotificationWhereInput = {
      destinataireId: userId,
    };

    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateEnvoi: 'desc' },
        include: {
          contrat: {
            select: { id: true, titre: true, statut: true },
          },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, lu: false } }),
    ]);

    return {
      data,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer une notification par ID
   */
  async findById(id: number): Promise<any> {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        contrat: true,
        destinataire: {
          select: { id: true, email: true, nom: true, prenom: true },
        },
      },
    });

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    return notification;
  }

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount(userId: number): Promise<number> {
    return prisma.notification.count({
      where: {
        destinataireId: userId,
        lu: false,
      },
    });
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: number, userId: number): Promise<any> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    if (notification.destinataireId !== userId) {
      throw new Error('Non autorisé à modifier cette notification');
    }

    return prisma.notification.update({
      where: { id },
      data: { lu: true },
    });
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: number): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        destinataireId: userId,
        lu: false,
      },
      data: { lu: true },
    });

    return result.count;
  }

  /**
   * Supprimer une notification
   */
  async delete(id: number, userId: number): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    if (notification.destinataireId !== userId) {
      throw new Error('Non autorisé à supprimer cette notification');
    }

    await prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Supprimer toutes les notifications lues
   */
  async deleteAllRead(userId: number): Promise<number> {
    const result = await prisma.notification.deleteMany({
      where: {
        destinataireId: userId,
        lu: true,
      },
    });

    return result.count;
  }

  // === Helpers pour créer des notifications spécifiques ===

  /**
   * Notification de nouvelle candidature
   */
  async notifyNewCandidature(publisherId: number, appelOffreTitle: string, candidatName: string): Promise<any> {
    return this.create({
      destinataireId: publisherId,
      destinataireType: 'APPEL_OFFRE',
      typeNotification: NotificationType.CANDIDATURE,
      titre: 'Nouvelle candidature',
      message: `${candidatName} a postulé à votre appel d'offres "${appelOffreTitle}"`,
    });
  }

  /**
   * Notification de candidature acceptée/refusée
   */
  async notifyCandidatureStatus(candidatId: number, appelOffreTitle: string, accepted: boolean): Promise<any> {
    return this.create({
      destinataireId: candidatId,
      destinataireType: 'FREELANCE',
      typeNotification: NotificationType.CANDIDATURE,
      titre: accepted ? 'Candidature acceptée' : 'Candidature refusée',
      message: accepted 
        ? `Félicitations ! Votre candidature pour "${appelOffreTitle}" a été acceptée.`
        : `Votre candidature pour "${appelOffreTitle}" n'a pas été retenue.`,
    });
  }

  /**
   * Notification de nouveau contrat
   */
  async notifyNewContrat(userId: number, userType: string, contratId: number, contratTitle: string): Promise<any> {
    return this.create({
      destinataireId: userId,
      destinataireType: userType,
      typeNotification: NotificationType.CONTRAT,
      titre: 'Nouveau contrat',
      message: `Un nouveau contrat "${contratTitle}" a été créé et attend votre signature.`,
      contratId,
    });
  }

  /**
   * Notification de contrat signé
   */
  async notifyContratSigned(userId: number, userType: string, contratId: number, contratTitle: string, bothSigned: boolean): Promise<any> {
    return this.create({
      destinataireId: userId,
      destinataireType: userType,
      typeNotification: NotificationType.CONTRAT,
      titre: bothSigned ? 'Contrat signé' : 'Signature enregistrée',
      message: bothSigned 
        ? `Le contrat "${contratTitle}" a été signé par les deux parties.`
        : `Une signature a été ajoutée au contrat "${contratTitle}".`,
      contratId,
    });
  }

  /**
   * Notification de nouveau message
   */
  async notifyNewMessage(userId: number, userType: string, senderName: string, contratId?: number): Promise<any> {
    return this.create({
      destinataireId: userId,
      destinataireType: userType,
      typeNotification: NotificationType.MESSAGE,
      titre: 'Nouveau message',
      message: `Vous avez reçu un nouveau message de ${senderName}.`,
      contratId,
    });
  }

  /**
   * Notification système
   */
  async notifySystem(userId: number, userType: string, titre: string, message: string): Promise<any> {
    return this.create({
      destinataireId: userId,
      destinataireType: userType,
      typeNotification: NotificationType.SYSTEME,
      titre,
      message,
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
