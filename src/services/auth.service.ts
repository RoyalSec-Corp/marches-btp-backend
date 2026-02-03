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
}

export interface RegisterAppelOffreDTO {
  email: string;
  password: string;
  entityType: 'individual' | 'company';
  // Personne Physique
  nom?: string;
  prenom?: string;
  telephone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  // Personne Morale
  companyName?: string;
  siret?: string;
  legalForm?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
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

// Service d'authentification
export const authService = {
  // Generer un code de parrainage unique
  generateReferralCode: (): string => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  },

  // Hasher le mot de passe
  hashPassword: async (password: string): Promise<string> => {
    const rounds = env.BCRYPT_ROUNDS || 12;
    return bcrypt.hash(password, rounds);
  },

  // Verifier le mot de passe
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  // Generer les tokens JWT
  generateTokens: (payload: TokenPayload): AuthTokens => {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: (env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: (env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
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
    // Verifier si l'email existe deja
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
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
        telephone: data.telephone,
        referralCode,
        freelance: {
          create: {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone,
            metier: data.metier,
            tarif: data.tarif,
            siret: data.siret,
            description: data.description,
            statutCompte: StatutCompte.EN_ATTENTE,
          },
        },
      },
      include: {
        freelance: true,
      },
    });

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
    // Verifier si l'email existe deja
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Verifier si le SIRET existe deja
    const existingSiret = await prisma.entreprise.findUnique({
      where: { siret: data.siret },
    });

    if (existingSiret) {
      throw new Error('SIRET_ALREADY_EXISTS');
    }

    // Hasher le mot de passe
    const hashedPassword = await authService.hashPassword(data.password);

    // Generer un code de parrainage
    const referralCode = authService.generateReferralCode();

    // Creer l'utilisateur et le profil entreprise
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        userType: UserType.ENTREPRISE,
        nom: data.representantLegal,
        telephone: data.telephone,
        adresse: data.adresse,
        ville: data.ville,
        codePostal: data.codePostal,
        referralCode,
        entreprise: {
          create: {
            raisonSociale: data.raisonSociale,
            siret: data.siret,
            email: data.email,
            telephone: data.telephone,
            adresse: data.adresse,
            ville: data.ville,
            codePostal: data.codePostal,
            representantLegal: data.representantLegal,
            formeJuridique: data.formeJuridique,
            statutCompte: StatutCompte.EN_ATTENTE,
          },
        },
      },
      include: {
        entreprise: true,
      },
    });

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

  // Inscription Appel d'Offre (Porteur de projet)
  registerAppelOffre: async (data: RegisterAppelOffreDTO) => {
    // Verifier si l'email existe deja
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hasher le mot de passe
    const hashedPassword = await authService.hashPassword(data.password);

    // Generer un code de parrainage
    const referralCode = authService.generateReferralCode();

    // Determiner les donnees selon le type d'entite
    const isCompany = data.entityType === 'company';

    // Creer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        userType: UserType.APPEL_OFFRE,
        nom: isCompany ? data.companyName : data.nom,
        prenom: isCompany ? undefined : data.prenom,
        telephone: data.telephone,
        adresse: data.address,
        ville: data.city,
        codePostal: data.postalCode,
        referralCode,
      },
    });

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
        prenom: user.prenom,
        referralCode: user.referralCode,
        entityType: data.entityType,
      },
      tokens,
    };
  },

  // Connexion
  login: async (data: LoginDTO, userAgent?: string) => {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        freelance: true,
        entreprise: true,
      },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verifier si le compte est actif
    if (!user.isActive) {
      throw new Error('ACCOUNT_DISABLED');
    }

    // Verifier le mot de passe
    const isPasswordValid = await authService.verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

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

    // Ne pas renvoyer le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
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
};

export default authService;
