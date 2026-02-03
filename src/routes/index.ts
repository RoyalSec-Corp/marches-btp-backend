import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import appelOffreRoutes from './appel-offre.routes.js';

const router = Router();

// Route de sante
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API MarchesBTP en ligne',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes admin
router.use('/admin', adminRoutes);

// Routes appels d'offres
router.use('/calls-for-tenders', appelOffreRoutes);

// TODO: Ajouter les autres routes
// router.use('/freelances', freelanceRoutes);
// router.use('/entreprises', entrepriseRoutes);
// router.use('/contrats', contratRoutes);
// router.use('/messages', messageRoutes);
// router.use('/notifications', notificationRoutes);

export default router;
