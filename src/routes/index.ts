import { Router } from 'express';
import authRoutes from './auth.routes.js';
import freelanceRoutes from './freelance.routes.js';
import entrepriseRoutes from './entreprise.routes.js';
import appelOffreRoutes from './appelOffre.routes.js';
import contratRoutes from './contrat.routes.js';
import notificationRoutes from './notification.routes.js';
import geocodingRoutes from './geocoding.routes.js';
import paiementRoutes from './paiement.routes.js';

const router = Router();

// Route de santé
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API MarchesBTP en ligne',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      freelances: '/api/freelances',
      entreprises: '/api/entreprises',
      appelsOffres: '/api/appels-offres',
      contrats: '/api/contrats',
      contracts: '/api/contracts',
      notifications: '/api/notifications',
      geocoding: '/api/geocoding',
      paiements: '/api/paiements',
    },
  });
});

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes utilisateurs
router.use('/freelances', freelanceRoutes);
router.use('/entreprises', entrepriseRoutes);

// Routes métier
router.use('/appels-offres', appelOffreRoutes);
router.use('/contrats', contratRoutes);
router.use('/contracts', contratRoutes); // Alias anglais pour compatibilité frontend
router.use('/notifications', notificationRoutes);
router.use('/paiements', paiementRoutes);

// Routes utilitaires
router.use('/geocoding', geocodingRoutes);

export default router;
