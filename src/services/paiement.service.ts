import { PrismaClient, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

class PaiementService {
  /**
   * Récupérer les paiements d'un freelance avec statistiques
   */
  async getFreelancePayments(freelanceId: number) {
    // Récupérer tous les paiements où le freelance est bénéficiaire
    const paiements = await prisma.paiement.findMany({
      where: {
        beneficiaireId: freelanceId,
        beneficiaireType: 'FREELANCE',
      },
      include: {
        contrat: {
          select: {
            id: true,
            titre: true,
            entreprise: {
              select: {
                raisonSociale: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateCreation: 'desc',
      },
    });

    // Calculer les statistiques
    const stats = {
      total: 0,
      platform: 0, // Paiements par carte
      cash: 0, // Paiements en espèces
      wallet: 0, // Solde disponible (paiements reçus - commissions)
      pending_commission_deductions: 0,
    };

    const history: any[] = [];

    for (const paiement of paiements) {
      if (paiement.statut === PaymentStatus.VALIDE || paiement.statut === PaymentStatus.COMPLETE) {
        stats.total += paiement.montant;

        const commission = paiement.montant * 0.05; // 5% de commission
        const net = paiement.montant - commission;

        if (paiement.methodePaiement === 'CARTE' || paiement.methodePaiement === 'VIREMENT') {
          stats.platform += paiement.montant;
          stats.wallet += net;
        } else if (paiement.methodePaiement === 'ESPECES') {
          stats.cash += paiement.montant;
          // Pour les espèces, la commission est déduite du wallet
          stats.pending_commission_deductions += commission;
        }

        history.push({
          date: paiement.datePaiement
            ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : new Date(paiement.dateCreation).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
          mission: paiement.contrat?.titre || `Contrat #${paiement.contratId}`,
          mode: paiement.methodePaiement === 'ESPECES' ? 'Espèces' : 'Carte',
          amount: paiement.montant,
          commission: commission,
          net: net,
          status:
            paiement.methodePaiement === 'ESPECES' ? 'commission_deducted' : 'completed',
          type:
            paiement.methodePaiement === 'ESPECES'
              ? 'wallet_deduction'
              : 'platform_transfer',
        });
      }
    }

    return {
      ...stats,
      history,
    };
  }

  /**
   * Récupérer les paiements d'une entreprise
   */
  async getEntreprisePayments(entrepriseId: number) {
    const paiements = await prisma.paiement.findMany({
      where: {
        payeurId: entrepriseId,
        payeurType: 'ENTREPRISE',
      },
      include: {
        contrat: {
          select: {
            id: true,
            titre: true,
            freelance: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateCreation: 'desc',
      },
    });

    const stats = {
      total: 0,
      paid: 0,
      pending: 0,
    };

    const history: any[] = [];

    for (const paiement of paiements) {
      stats.total += paiement.montant;

      if (paiement.statut === PaymentStatus.VALIDE || paiement.statut === PaymentStatus.COMPLETE) {
        stats.paid += paiement.montant;
      } else if (paiement.statut === PaymentStatus.EN_ATTENTE) {
        stats.pending += paiement.montant;
      }

      history.push({
        date: paiement.dateCreation.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        mission: paiement.contrat?.titre || `Contrat #${paiement.contratId}`,
        freelance: paiement.contrat?.freelance
          ? `${paiement.contrat.freelance.prenom} ${paiement.contrat.freelance.nom}`
          : 'Freelance',
        amount: paiement.montant,
        status: paiement.statut,
        method: paiement.methodePaiement,
      });
    }

    return {
      ...stats,
      history,
    };
  }

  /**
   * Créer un paiement
   */
  async create(data: {
    contratId: number;
    milestoneId?: number;
    montant: number;
    payeurId: number;
    payeurType: string;
    beneficiaireId: number;
    beneficiaireType: string;
    methodePaiement: string;
    dateEcheance?: Date;
  }) {
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return prisma.paiement.create({
      data: {
        reference,
        contratId: data.contratId,
        milestoneId: data.milestoneId,
        montant: data.montant,
        montantHT: data.montant / 1.2, // TVA 20%
        montantTVA: data.montant - data.montant / 1.2,
        payeurId: data.payeurId,
        payeurType: data.payeurType,
        beneficiaireId: data.beneficiaireId,
        beneficiaireType: data.beneficiaireType,
        methodePaiement: data.methodePaiement as any,
        dateEcheance: data.dateEcheance,
      },
    });
  }

  /**
   * Valider un paiement
   */
  async validate(paiementId: number) {
    return prisma.paiement.update({
      where: { id: paiementId },
      data: {
        statut: PaymentStatus.VALIDE,
        datePaiement: new Date(),
      },
    });
  }

  /**
   * Récupérer un paiement par ID
   */
  async getById(paiementId: number) {
    return prisma.paiement.findUnique({
      where: { id: paiementId },
      include: {
        contrat: true,
        milestone: true,
      },
    });
  }
}

export const paiementService = new PaiementService();
export default paiementService;
