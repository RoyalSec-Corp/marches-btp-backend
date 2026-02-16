import { PrismaClient, Prisma } from '@prisma/client';
import { deleteFile, getFileUrl } from '../config/multer.config.js';

const prisma = new PrismaClient();

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface DocumentInfo {
  type: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

class UploadService {
  /**
   * Traiter les fichiers uploadés et retourner les infos structurées
   */
  processUploadedFiles(files: { [fieldname: string]: Express.Multer.File[] } | undefined): Record<string, DocumentInfo> {
    const documents: Record<string, DocumentInfo> = {};

    if (!files) {
      return documents;
    }

    for (const [fieldname, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        documents[fieldname] = {
          type: fieldname,
          originalName: file.originalname,
          path: file.path,
          url: getFileUrl(file.path),
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
        };
      }
    }

    return documents;
  }

  /**
   * Mettre à jour les documents d'un freelance
   */
  async updateFreelanceDocuments(userId: number, documents: Record<string, DocumentInfo>): Promise<void> {
    const updateData: Prisma.FreelanceUpdateInput = {};

    // Mapper les documents aux champs Prisma
    if (documents.photo) {
      updateData.photoUrl = documents.photo.url;
    }
    if (documents.kbis) {
      updateData.kbisUrl = documents.kbis.url;
    }
    if (documents.assurance) {
      updateData.assuranceUrl = documents.assurance.url;
    }
    if (documents.cv) {
      updateData.cvUrl = documents.cv.url;
    }

    // Stocker les certifications comme JSON si présentes
    if (documents.certifications) {
      // Pour les certifications multiples, on stocke l'URL dans un array JSON
      const existingFreelance = await prisma.freelance.findUnique({
        where: { userId },
        select: { certifications: true },
      });
      
      const existingCerts = existingFreelance?.certifications 
        ? (typeof existingFreelance.certifications === 'string' 
            ? JSON.parse(existingFreelance.certifications) 
            : existingFreelance.certifications)
        : [];
      
      updateData.certifications = JSON.stringify([...existingCerts, documents.certifications.url]);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.freelance.update({
        where: { userId },
        data: updateData,
      });
    }
  }

  /**
   * Mettre à jour les documents d'une entreprise
   */
  async updateEntrepriseDocuments(userId: number, documents: Record<string, DocumentInfo>): Promise<void> {
    const updateData: Prisma.EntrepriseUpdateInput = {};

    if (documents.logo) {
      updateData.logoUrl = documents.logo.url;
    }
    if (documents.kbis) {
      updateData.kbisUrl = documents.kbis.url;
    }
    if (documents.attestationAssurance) {
      updateData.assuranceUrl = documents.attestationAssurance.url;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.entreprise.update({
        where: { userId },
        data: updateData,
      });
    }
  }

  /**
   * Supprimer un document d'un freelance
   */
  async deleteFreelanceDocument(userId: number, documentType: string): Promise<void> {
    const freelance = await prisma.freelance.findUnique({
      where: { userId },
      select: { photoUrl: true, kbisUrl: true, assuranceUrl: true, cvUrl: true },
    });

    if (!freelance) {
      throw new Error('Freelance non trouvé');
    }

    const fieldMap: Record<string, keyof typeof freelance> = {
      photo: 'photoUrl',
      kbis: 'kbisUrl',
      assurance: 'assuranceUrl',
      cv: 'cvUrl',
    };

    const field = fieldMap[documentType];
    if (!field) {
      throw new Error(`Type de document invalide: ${documentType}`);
    }

    const currentUrl = freelance[field];
    if (currentUrl) {
      // Supprimer le fichier physique
      const filePath = currentUrl.startsWith('/') ? currentUrl.substring(1) : currentUrl;
      try {
        await deleteFile(filePath);
      } catch (error) {
        console.warn(`Impossible de supprimer le fichier: ${filePath}`, error);
      }

      // Mettre à jour la BDD
      await prisma.freelance.update({
        where: { userId },
        data: { [field]: null },
      });
    }
  }

  /**
   * Supprimer un document d'une entreprise
   */
  async deleteEntrepriseDocument(userId: number, documentType: string): Promise<void> {
    const entreprise = await prisma.entreprise.findUnique({
      where: { userId },
      select: { logoUrl: true, kbisUrl: true, assuranceUrl: true },
    });

    if (!entreprise) {
      throw new Error('Entreprise non trouvée');
    }

    const fieldMap: Record<string, keyof typeof entreprise> = {
      logo: 'logoUrl',
      kbis: 'kbisUrl',
      assurance: 'assuranceUrl',
    };

    const field = fieldMap[documentType];
    if (!field) {
      throw new Error(`Type de document invalide: ${documentType}`);
    }

    const currentUrl = entreprise[field];
    if (currentUrl) {
      const filePath = currentUrl.startsWith('/') ? currentUrl.substring(1) : currentUrl;
      try {
        await deleteFile(filePath);
      } catch (error) {
        console.warn(`Impossible de supprimer le fichier: ${filePath}`, error);
      }

      await prisma.entreprise.update({
        where: { userId },
        data: { [field]: null },
      });
    }
  }

  /**
   * Obtenir les documents d'un freelance
   */
  async getFreelanceDocuments(userId: number): Promise<Record<string, string | null>> {
    const freelance = await prisma.freelance.findUnique({
      where: { userId },
      select: { photoUrl: true, kbisUrl: true, assuranceUrl: true, cvUrl: true, certifications: true },
    });

    if (!freelance) {
      throw new Error('Freelance non trouvé');
    }

    return {
      photo: freelance.photoUrl,
      kbis: freelance.kbisUrl,
      assurance: freelance.assuranceUrl,
      cv: freelance.cvUrl,
      certifications: freelance.certifications as string | null,
    };
  }

  /**
   * Obtenir les documents d'une entreprise
   */
  async getEntrepriseDocuments(userId: number): Promise<Record<string, string | null>> {
    const entreprise = await prisma.entreprise.findUnique({
      where: { userId },
      select: { logoUrl: true, kbisUrl: true, assuranceUrl: true },
    });

    if (!entreprise) {
      throw new Error('Entreprise non trouvée');
    }

    return {
      logo: entreprise.logoUrl,
      kbis: entreprise.kbisUrl,
      assurance: entreprise.assuranceUrl,
    };
  }
}

export const uploadService = new UploadService();
export default uploadService;
