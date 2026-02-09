import { Router } from 'express';
import { entrepriseController } from '../controllers/entreprise.controller.js';
import { uploadController } from '../controllers/upload.controller.js';
import { authenticate, requireEntreprise } from '../middlewares/auth.middleware.js';
import { uploadEntrepriseDocuments } from '../config/multer.config.js';

const router = Router();

// === Routes protégées (entreprise connectée) - AVANT les routes avec paramètres ===

// Profil
router.get('/profile', authenticate, requireEntreprise, entrepriseController.getMyProfile);
router.put('/profile', authenticate, requireEntreprise, entrepriseController.updateMyProfile);

// Documents (Upload/Download/Delete)
router.get('/documents', authenticate, requireEntreprise, uploadController.getEntrepriseDocuments);
router.post('/documents', authenticate, requireEntreprise, uploadEntrepriseDocuments, uploadController.uploadEntrepriseDocuments);
router.delete('/documents/:type', authenticate, requireEntreprise, uploadController.deleteEntrepriseDocument);

// === Routes publiques ===
router.get('/search', entrepriseController.search);
router.get('/siret/:siret', entrepriseController.getBySiret);
router.get('/', entrepriseController.listAll);
router.get('/:id', entrepriseController.getById);

export default router;
