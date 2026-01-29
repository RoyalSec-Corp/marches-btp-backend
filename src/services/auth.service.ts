import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import {
  JwtPayload,
  JwtTokens,
  RegisterFreelanceDto,
  RegisterEntrepriseDto,
  UserResponse,
} from '../types/auth.types.js';
import { UserType, ModeTarification, TypePersonne } from '@prisma/client';

class AuthService {
  // ===== GÉNÉRATION DE TOKENS =====

  generateTokens(payload: JwtPayload): JwtTokens {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  }

  // ===== MOT DE PASSE =====

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ===== CODE PARRAINAGE =====

  generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // ===== CONNEXION =====

  async login(email: string, password: string): Promise<{ user: UserResponse; tokens: JwtTokens }> {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        freelance: true,
        entreprise: true,
      },
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new Error('Votre compte a été désactivé');
    }

    // Générer les tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    };
    const tokens = this.generateTokens(payload);

    // Créer une session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        userAgent: '',
        ipAddress: '',
      },
    });

    // Formater la réponse
    const userResponse = this.formatUserResponse(user);

    return { user: userResponse, tokens };
  }

  // ===== INSCRIPTION FREELANCE =====

  async registerFreelance(data: RegisterFreelanceDto): Promise<{ user: UserResponse; tokens: JwtTokens }> {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await this.hashPassword(data.password);

    // Générer un code de parrainage
    const referralCode = this.generateReferralCode();

    // Créer l'utilisateur et le profil freelance en transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          userType: UserType.FREELANCE,
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          adresse: data.adresse,
          ville: data.ville,
          codePostal: data.codePostal,
          referralCode,
        },
      });

      await tx.freelance.create({
        data: {
          userId: newUser.id,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email.toLowerCase(),
          telephone: data.telephone,
          metier: data.metier,
          tarif: data.tarif,
          modeTarification: (data.modeTarification as ModeTarification) || ModeTarification.JOUR,
          siret: data.siret,
          experienceYears: data.experienceYears,
          description: data.description,
        },
      });

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: { freelance: true, entreprise: true },
      });
    });

    if (!user) {
      throw new Error('Erreur lors de la création du compte');
    }

    // Générer les tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    };
    const tokens = this.generateTokens(payload);

    // Créer une session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: '',
        ipAddress: '',
      },
    });

    const userResponse = this.formatUserResponse(user);
    return { user: userResponse, tokens };
  }

  // ===== INSCRIPTION ENTREPRISE =====

  async registerEntreprise(data: RegisterEntrepriseDto): Promise<{ user: UserResponse; tokens: JwtTokens }> {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Vérifier si le SIRET existe déjà
    const existingSiret = await prisma.entreprise.findUnique({
      where: { siret: data.siret },
    });

    if (existingSiret) {
      throw new Error('Ce SIRET est déjà enregistré');
    }

    // Hasher le mot de passe
    const hashedPassword = await this.hashPassword(data.password);

    // Générer un code de parrainage
    const referralCode = this.generateReferralCode();

    // Créer l'utilisateur et le profil entreprise en transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          userType: UserType.ENTREPRISE,
          nom: data.nomContact,
          prenom: data.prenomContact,
          telephone: data.telephone,
          adresse: data.adresse,
          ville: data.ville,
          codePostal: data.codePostal,
          referralCode,
        },
      });

      await tx.entreprise.create({
        data: {
          userId: newUser.id,
          raisonSociale: data.raisonSociale,
          siret: data.siret,
          telephone: data.telephone,
          secteurActivite: data.secteurActivite,
          tailleEntreprise: data.tailleEntreprise,
          typePersonne: (data.typePersonne as TypePersonne) || TypePersonne.PROFESSIONNEL,
          adresse: data.adresse,
          ville: data.ville,
          codePostal: data.codePostal,
          nomContact: data.nomContact,
          prenomContact: data.prenomContact,
          emailContact: data.emailContact,
          telephoneContact: data.telephoneContact,
        },
      });

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: { freelance: true, entreprise: true },
      });
    });

    if (!user) {
      throw new Error('Erreur lors de la création du compte');
    }

    // Générer les tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    };
    const tokens = this.generateTokens(payload);

    // Créer une session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: '',
        ipAddress: '',
      },
    });

    const userResponse = this.formatUserResponse(user);
    return { user: userResponse, tokens };
  }

  // ===== DÉCONNEXION =====

  async logout(userId: number, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Supprimer uniquement la session avec ce token
      await prisma.session.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } else {
      // Supprimer toutes les sessions de l'utilisateur
      await prisma.session.deleteMany({
        where: { userId },
      });
    }
  }

  // ===== REFRESH TOKEN =====

  async refreshTokens(refreshToken: string): Promise<JwtTokens> {
    // Vérifier le token
    const payload = this.verifyRefreshToken(refreshToken);

    // Vérifier si la session existe
    const session = await prisma.session.findFirst({
      where: {
        userId: payload.userId,
        token: refreshToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new Error('Session invalide ou expirée');
    }

    // Vérifier si l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new Error('Utilisateur non trouvé ou inactif');
    }

    // Générer de nouveaux tokens
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    };
    const tokens = this.generateTokens(newPayload);

    // Mettre à jour la session avec le nouveau refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  // ===== PROFIL UTILISATEUR =====

  async getProfile(userId: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        freelance: true,
        entreprise: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return this.formatUserResponse(user);
  }

  // ===== MOT DE PASSE OUBLIÉ =====

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return;
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // TODO: Envoyer l'email avec le lien de réinitialisation
    console.log(`[DEV] Reset token for ${email}: ${resetToken}`);
  }

  // ===== RÉINITIALISATION DU MOT DE PASSE =====

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Token invalide ou expiré');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await this.hashPassword(newPassword);

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    // Supprimer toutes les sessions existantes
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
  }

  // ===== FORMATER LA RÉPONSE UTILISATEUR =====

  private formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      userType: user.userType,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      freelance: user.freelance
        ? {
            id: user.freelance.id,
            nom: user.freelance.nom,
            prenom: user.freelance.prenom,
            metier: user.freelance.metier,
            tarif: user.freelance.tarif,
            modeTarification: user.freelance.modeTarification,
            disponible: user.freelance.disponible,
            statutCompte: user.freelance.statutCompte,
          }
        : null,
      entreprise: user.entreprise
        ? {
            id: user.entreprise.id,
            raisonSociale: user.entreprise.raisonSociale,
            siret: user.entreprise.siret,
            secteurActivite: user.entreprise.secteurActivite,
            statutCompte: user.entreprise.statutCompte,
          }
        : null,
    };
  }
}

export const authService = new AuthService();
