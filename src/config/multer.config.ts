import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Créer les dossiers d'upload s'ils n'existent pas
const uploadDirs = ['uploads', 'uploads/documents', 'uploads/photos', 'uploads/kbis', 'uploads/assurances'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Types de fichiers autorisés par catégorie
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  documents: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  photos: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  kbis: ['application/pdf'],
  assurances: ['application/pdf', 'image/jpeg', 'image/png'],
};

// Taille max par type (en bytes)
const MAX_FILE_SIZE: Record<string, number> = {
  documents: 10 * 1024 * 1024, // 10MB
  photos: 5 * 1024 * 1024,     // 5MB
  kbis: 5 * 1024 * 1024,       // 5MB
  assurances: 10 * 1024 * 1024, // 10MB
};

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Déterminer le dossier selon le type de fichier
    let uploadDir = 'uploads/documents';
    
    if (file.fieldname === 'photo' || file.fieldname === 'avatar') {
      uploadDir = 'uploads/photos';
    } else if (file.fieldname === 'kbis') {
      uploadDir = 'uploads/kbis';
    } else if (file.fieldname === 'assurance' || file.fieldname === 'attestationAssurance') {
      uploadDir = 'uploads/assurances';
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Générer un nom unique : userId_timestamp_originalname
    const userId = (req as any).user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    
    cb(null, `${userId}_${timestamp}_${baseName}${ext}`);
  },
});

// Filtre des fichiers
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Déterminer la catégorie selon le fieldname
  let category = 'documents';
  if (file.fieldname === 'photo' || file.fieldname === 'avatar') {
    category = 'photos';
  } else if (file.fieldname === 'kbis') {
    category = 'kbis';
  } else if (file.fieldname === 'assurance' || file.fieldname === 'attestationAssurance') {
    category = 'assurances';
  }

  const allowedTypes = ALLOWED_MIME_TYPES[category];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé pour ${file.fieldname}. Types acceptés: ${allowedTypes.join(', ')}`));
  }
};

// Instance Multer principale
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max par défaut
    files: 5, // Max 5 fichiers par requête
  },
});

// Configurations spécifiques pour différents cas d'usage

// Upload photo de profil (single)
export const uploadPhoto = upload.single('photo');

// Upload documents freelance (Kbis optionnel, assurance, CV)
export const uploadFreelanceDocuments = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'kbis', maxCount: 1 },
  { name: 'assurance', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'certifications', maxCount: 5 },
]);

// Upload documents entreprise (Kbis obligatoire, assurance)
export const uploadEntrepriseDocuments = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'kbis', maxCount: 1 },
  { name: 'attestationAssurance', maxCount: 1 },
  { name: 'autresDocuments', maxCount: 5 },
]);

// Upload pour appels d'offres (cahier des charges, plans, etc.)
export const uploadAppelOffreDocuments = upload.fields([
  { name: 'cahierDesCharges', maxCount: 1 },
  { name: 'plans', maxCount: 10 },
  { name: 'annexes', maxCount: 10 },
]);

// Helper pour supprimer un fichier
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Helper pour obtenir l'URL publique d'un fichier
export const getFileUrl = (filePath: string): string => {
  // Retourne le chemin relatif depuis la racine uploads
  return `/${filePath}`;
};

export default upload;
