import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import {
  LoginInput,
  RegisterFreelanceInput,
  RegisterEntrepriseInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validations/auth.validation.js';

class AuthController {
  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/register/freelance
  async registerFreelance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as RegisterFreelanceInput;

      const result = await authService.registerFreelance(data);

      res.status(201).json({
        success: true,
        message: 'Compte freelance créé avec succès',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/register/entreprise
  async registerEntreprise(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as RegisterEntrepriseInput;

      const result = await authService.registerEntreprise(data);

      res.status(201).json({
        success: true,
        message: 'Compte entreprise créé avec succès',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const refreshToken = req.body.refreshToken;

      if (userId) {
        await authService.logout(userId, refreshToken);
      }

      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;

      const tokens = await authService.refreshTokens(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens rafraîchis',
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
        return;
      }

      const user = await authService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/verify
  async verifyToken(req: Request, res: Response): Promise<void> {
    // Si on arrive ici, le token est valide (middleware authenticate)
    res.status(200).json({
      success: true,
      message: 'Token valide',
      data: { user: req.user },
    });
  }

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as ForgotPasswordInput;

      await authService.forgotPassword(email);

      // Toujours renvoyer succès pour ne pas révéler si l'email existe
      res.status(200).json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/reset-password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body as ResetPasswordInput;

      await authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
