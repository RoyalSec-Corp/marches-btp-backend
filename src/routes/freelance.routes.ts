import { Router } from 'express';
import { freelanceController } from '../controllers/freelance.controller.js';
import { uploadController } from '../controllers/upload.controller.js';
import { authenticate, requireFreelance } from '../middlewares/auth.middleware.js';
import { uploadFreelanceDocuments } from '../config/multer.config.js';

const router = Router();

// === Routes protégées (freelance connecté) - AVANT les routes avec paramètres ===

// Profil
router.get('/profile', authenticate, requireFreelance, freelanceController.getMyProfile);
router.put('/profile', authenticate, requireFreelance, freelanceController.updateMyProfile);
router.patch('/disponibilite', authenticate, requireFreelance, freelanceController.updateDisponibilite);

// Documents (Upload/Download/Delete)
router.get('/documents', authenticate, requireFreelance, uploadController.getFreelanceDocuments);
router.post('/documents', authenticate, requireFreelance, uploadFreelanceDocuments, uploadController.uploadFreelanceDocuments);
router.delete('/documents/:type', authenticate, requireFreelance, uploadController.deleteFreelanceDocument);

// === Routes publiques ===
router.get('/search', freelanceController.search);
router.get('/', freelanceController.listAll);
router.get('/:id', freelanceController.getById);

export default router;
