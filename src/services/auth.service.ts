import { PrismaClient, UserType, StatutCompte } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Types
export interface RegisterFreelanceDTO {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  metier: string;
  tarif: number;
  siret?: string;
  description?: string;
}

export interface RegisterEntrepriseDTO {
  email: string;
  password: string;
  raisonSociale: string;
  siret: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  representantLegal: string;
  formeJuridique?: string;
  nafCode?: string;
  nom?: string;
  prenom?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  userType: UserType;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Helpers pour nettoyer les données
const cleanSiret = (siret: string | undefined): string => {
  return siret ? siret.replace(/\D/g, '') : '';
};

const cleanPhone = (phone: string | undefined): string | undefined => {
  if (!phone) {
    return undefined;
  }
  const cleaned = phone.replace(/\s/g, '');
  return cleaned || undefined;
};

const cleanPostalCode = (code: string | undefined): string | undefined => {
  if (!code) {
    return undefined;
  }
  const cleaned = code.replace(/\D/g, '');
  return cleaned || undefined;
};

// Service d'authentification
export const authService = {
  // Generer un code de parrainage unique
  generateReferralCode: (): string => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  },

  // Générer un token de réinitialisation
  generateResetToken: (): string => {
    return crypto.randomBytes(32).toString('hex');
  },

  // Hasher le mot de passe
  hashPassword: async (password: string): Promise<string> => {
    const rounds = Number(env.BCRYPT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(rounds);
    const hash = await bcrypt.hash(password, salt);
    console.log(`[DEBUG] hashPassword: rounds=${rounds}, password length=${password.length}, hash=${hash.substring(0, 20)}...`);
    return hash;
  },

  // Verifier le mot de passe
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    const result = await bcrypt.compare(password, hash);
    console.log(`[DEBUG] verifyPassword: password length=${password.length}, hash=${hash.substring(0, 20)}..., result=${result}`);
    return result;
  },

  // Generer les tokens JWT
  generateTokens: (payload: TokenPayload): AuthTokens => {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  },

  // Verifier le token d'acces
  verifyAccessToken: (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  },

  // Verifier le refresh token
  verifyRefreshToken: (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  },

  // Inscription Freelance
  registerFreelance: async (data: RegisterFreelanceDTO) => {
    console.log('[DEBUG] registerFreelance called with:', { ...data, password: '***' });
    
    // Verifier si l'email existe deja
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log('[DEBUG] Email already exists:', data.email);
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hasher le mot de passe
    const hashedPassword = await authService.hashPassword(data.password);

    // Generer un code de parrainage
    const referralCode = authService.generateReferralCode();

    // Creer l'utilisateur et le profil freelance
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        userType: UserType.FREELANCE,
        nom: data.nom,
        prenom: data.prenom,
        telephone: cleanPhone(data.telephone),
        referralCode,
        freelance: {
          create: {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: cleanPhone(data.telephone),
            metier: data.metier,
            tarif: data.tarif,
            siret: cleanSiret(data.siret) || undefined,
            description: data.description,
            statutCompte: StatutCompte.EN_ATTENTE,
          },
        },
      },
      include: {
        freelance: true,
      },
    });

    console.log('[DEBUG] Freelance created successfully:', user.id);

    // Generer les tokens
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Creer la session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        userAgent: 'API',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        nom: user.nom,
        prenom: user.prenom,
        referralCode: user.referralCode,
        freelance: user.freelance,
      },
      tokens,
    };
  },

  // Inscription Entreprise
  registerEntreprise: async (data: RegisterEntrepriseDTO) => {
    console.log('[DEBUG] registerEntreprise called with:', { ...data, password: '***' });
    
    // Nettoyer le SIRET
    const siret = cleanSiret(data.siret);
    console.log('[DEBUG] Cleaned SIRET:', siret, 'length:', siret.length);
    
    // Valider le SIRET
    if (!siret || siret.length !== 14) {
      console.log('[DEBUG] Invalid SIRET format');
      throw new Error('Le SIRET doit contenir exactement 14 chiffres.');
    }
    
    // Verifier si l'email existe deja
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log('[DEBUG] Email already exists:', data.email);
      throw new Error('Cet email est déjà utilisé.');
    }

    // Verifier si le SIRET existe deja
    const existingSiret = await prisma.entreprise.findUnique({
      where: { siret: siret },
    });

    if (existingSiret) {
      console.log('[DEBUG] SIRET already exists:', siret);
      throw new Error('Ce numéro SIRET est déjà enregistré.');
    }

    // Hasher le mot de passe
    const hashedPassword = await authService.hashPassword(data.password);

    // Generer un code de parrainage
    const referralCode = authService.generateReferralCode();

    console.log('[DEBUG] Creating entreprise with data:', {
      email: data.email,
      raisonSociale: data.raisonSociale,
      siret: siret,
      representantLegal: data.representantLegal,
    });

    // Creer l'utilisateur et le profil entreprise
    // Note: Le schéma Entreprise n'a pas de champ secteurActivite, seulement nafCode
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        userType: UserType.ENTREPRISE,
        nom: data.nom || data.representantLegal,
        prenom: data.prenom,
        telephone: cleanPhone(data.telephone),
        adresse: data.adresse,
        ville: data.ville,
        codePostal: cleanPostalCode(data.codePostal),
        referralCode,
        entreprise: {
          create: {
            raisonSociale: data.raisonSociale,
            siret: siret,
            email: data.email,
            telephone: cleanPhone(data.telephone),
            adresse: data.adresse,
            ville: data.ville,
            codePostal: cleanPostalCode(data.codePostal),
            representantLegal: data.representantLegal,
            formeJuridique: data.formeJuridique,
            nafCode: data.nafCode,
            statutCompte: StatutCompte.EN_ATTENTE,
          },
        },
      },
      include: {
        entreprise: true,
      },
    });

    console.log('[DEBUG] Entreprise created successfully:', user.id);

    // Generer les tokens
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Creer la session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: 'API',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        nom: user.nom,
        referralCode: user.referralCode,
        entreprise: user.entreprise,
      },
      tokens,
    };
  },

  // Connexion
  login: async (data: LoginDTO, userAgent?: string) => {
    console.log(`[DEBUG] login attempt for: ${data.email}`);
    
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        freelance: true,
        entreprise: true,
      },
    });

    if (!user) {
      console.log(`[DEBUG] user not found: ${data.email}`);
      throw new Error('INVALID_CREDENTIALS');
    }

    console.log(`[DEBUG] user found, stored hash: ${user.password.substring(0, 20)}...`);

    // Verifier si le compte est actif
    if (!user.isActive) {
      throw new Error('ACCOUNT_DISABLED');
    }

    // Verifier le mot de passe
    const isPasswordValid = await authService.verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      console.log(`[DEBUG] password invalid for: ${data.email}`);
      throw new Error('INVALID_CREDENTIALS');
    }

    console.log(`[DEBUG] login successful for: ${data.email}`);

    // Generer les tokens
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Creer la session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: userAgent || 'Unknown',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        nom: user.nom,
        prenom: user.prenom,
        referralCode: user.referralCode,
        freelance: user.freelance,
        entreprise: user.entreprise,
      },
      tokens,
    };
  },

  // Deconnexion
  logout: async (refreshToken: string) => {
    await prisma.session.deleteMany({
      where: { refreshToken },
    });
  },

  // Rafraichir le token
  refreshTokens: async (refreshToken: string) => {
    // Verifier le refresh token
    const payload = authService.verifyRefreshToken(refreshToken);

    // Verifier que la session existe
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new Error('SESSION_EXPIRED');
    }

    // Recuperer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new Error('USER_NOT_FOUND');
    }

    // Generer de nouveaux tokens
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Mettre a jour la session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  },

  // Obtenir le profil utilisateur
  getProfile: async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        freelance: true,
        entreprise: true,
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Ne pas renvoyer le mot de passe - extraire et ignorer
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Verifier le token (pour les routes protegees)
  verifyToken: async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        userType: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  },

  /**
   * Changer le mot de passe (utilisateur connecté)
   * Fonctionne pour tous les types de comptes
   */
  changePassword: async (userId: number, data: ChangePasswordDTO) => {
    console.log(`[DEBUG] changePassword for userId: ${userId}`);
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    console.log(`[DEBUG] current hash in DB: ${user.password.substring(0, 20)}...`);

    // Vérifier l'ancien mot de passe
    const isCurrentPasswordValid = await authService.verifyPassword(
      data.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      console.log(`[DEBUG] current password invalid`);
      throw new Error('INVALID_CURRENT_PASSWORD');
    }

    // Vérifier que le nouveau mot de passe est différent
    if (data.currentPassword === data.newPassword) {
      throw new Error('SAME_PASSWORD');
    }

    // Hasher le nouveau mot de passe
    console.log(`[DEBUG] hashing new password...`);
    const hashedPassword = await authService.hashPassword(data.newPassword);
    console.log(`[DEBUG] new hash: ${hashedPassword.substring(0, 20)}...`);

    // Mettre à jour le mot de passe
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
      },
    });

    console.log(`[DEBUG] password updated in DB, new hash: ${updated.password.substring(0, 20)}...`);

    // Vérifier immédiatement que le nouveau mot de passe fonctionne
    const verifyNewPassword = await authService.verifyPassword(data.newPassword, updated.password);
    console.log(`[DEBUG] verification of new password: ${verifyNewPassword}`);

    if (!verifyNewPassword) {
      console.error(`[ERROR] New password verification failed immediately after save!`);
    }

    return { success: true };
  },

  /**
   * Demande de réinitialisation de mot de passe (mot de passe oublié)
   * Génère un token et le stocke (en prod, envoyer par email)
   */
  forgotPassword: async (email: string) => {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      // On retourne success même si l'email n'existe pas
      return { 
        success: true, 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' 
      };
    }

    // Générer un token de réinitialisation
    const resetToken = authService.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Stocker le token hashé en base (utilise les champs du schéma Prisma)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: resetTokenExpiry,
      },
    });

    // En production: envoyer l'email avec le lien
    const resetUrl = `${env.APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // TODO: Intégrer Nodemailer pour envoyer l'email
    console.log(`[DEV] Reset URL pour ${email}: ${resetUrl}`);

    return {
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      // En dev seulement, retourner le token pour tester
      ...(env.NODE_ENV === 'development' && { resetToken, resetUrl }),
    };
  },

  /**
   * Réinitialiser le mot de passe avec le token
   */
  resetPassword: async (data: ResetPasswordDTO) => {
    console.log(`[DEBUG] resetPassword with token: ${data.token.substring(0, 10)}...`);
    
    // Hasher le token reçu pour comparer avec celui en base
    const hashedToken = crypto.createHash('sha256').update(data.token).digest('hex');

    // Trouver l'utilisateur avec ce token non expiré (utilise les champs du schéma Prisma)
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      console.log(`[DEBUG] no user found with valid reset token`);
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    console.log(`[DEBUG] user found: ${user.email}`);

    // Hasher le nouveau mot de passe
    const hashedPassword = await authService.hashPassword(data.newPassword);

    // Mettre à jour le mot de passe et supprimer le token
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    console.log(`[DEBUG] password reset complete, new hash: ${updated.password.substring(0, 20)}...`);

    // Vérifier immédiatement
    const verifyNewPassword = await authService.verifyPassword(data.newPassword, updated.password);
    console.log(`[DEBUG] verification of reset password: ${verifyNewPassword}`);

    // Invalider toutes les sessions existantes (sécurité)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return { 
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Veuillez vous reconnecter.',
    };
  },
};

export default authService;
