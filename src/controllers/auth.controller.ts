import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export const authController = {
  // POST /api/auth/register/freelance
  registerFreelance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.registerFreelance(req.body);

      res.status(201).json({
        success: true,
        message: 'Inscription réussie. Bienvenue sur Marchés BTP !',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé.',
          error: 'EMAIL_ALREADY_EXISTS',
        });
      }
      next(error);
    }
  },

  // POST /api/auth/register/entreprise
  registerEntreprise: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.registerEntreprise(req.body);

      res.status(201).json({
        success: true,
        message: 'Inscription réussie. Bienvenue sur Marchés BTP !',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé.',
          error: 'EMAIL_ALREADY_EXISTS',
        });
      }
      if (error.message === 'SIRET_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Ce numéro SIRET est déjà enregistré.',
          error: 'SIRET_ALREADY_EXISTS',
        });
      }
      next(error);
    }
  },

  // POST /api/auth/login
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userAgent = req.headers['user-agent'];
      const result = await authService.login(req.body, userAgent);

      res.json({
        success: true,
        message: 'Connexion réussie.',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect.',
          error: 'INVALID_CREDENTIALS',
        });
      }
      if (error.message === 'ACCOUNT_DISABLED') {
        return res.status(403).json({
          success: false,
          message: 'Votre compte a été désactivé.',
          error: 'ACCOUNT_DISABLED',
        });
      }
      next(error);
    }
  },

  // POST /api/auth/logout
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.json({
        success: true,
        message: 'Déconnexion réussie.',
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/refresh
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token requis.',
          error: 'MISSING_REFRESH_TOKEN',
        });
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.json({
        success: true,
        message: 'Tokens rafraîchis.',
        data: tokens,
      });
    } catch (error: any) {
      if (error.message === 'SESSION_EXPIRED' || error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Session expirée. Veuillez vous reconnecter.',
          error: 'SESSION_EXPIRED',
        });
      }
      next(error);
    }
  },

  // GET /api/auth/profile
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié.',
          error: 'UNAUTHORIZED',
        });
      }

      const profile = await authService.getProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé.',
          error: 'USER_NOT_FOUND',
        });
      }
      next(error);
    }
  },

  // GET /api/auth/verify
  verifyToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié.',
          error: 'UNAUTHORIZED',
        });
      }

      const user = await authService.verifyToken(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.',
        error: 'INVALID_TOKEN',
      });
    }
  },

  // PUT /api/auth/change-password
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié.',
          error: 'UNAUTHORIZED',
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel et nouveau mot de passe requis.',
          error: 'MISSING_FIELDS',
        });
      }

      // Validation du nouveau mot de passe
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
          error: 'WEAK_PASSWORD',
        });
      }

      await authService.changePassword(userId, { currentPassword, newPassword });

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès.',
      });
    } catch (error: any) {
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel incorrect.',
          error: 'INVALID_CURRENT_PASSWORD',
        });
      }
      if (error.message === 'SAME_PASSWORD') {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit être différent de l\'ancien.',
          error: 'SAME_PASSWORD',
        });
      }
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé.',
          error: 'USER_NOT_FOUND',
        });
      }
      next(error);
    }
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email requis.',
          error: 'MISSING_EMAIL',
        });
      }

      const result = await authService.forgotPassword(email);

      res.json({
        success: true,
        message: result.message,
        // En dev, retourner le token pour tester
        ...(result.resetToken && { resetToken: result.resetToken, resetUrl: result.resetUrl }),
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/reset-password
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token et nouveau mot de passe requis.',
          error: 'MISSING_FIELDS',
        });
      }

      // Validation du nouveau mot de passe
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 8 caractères.',
          error: 'WEAK_PASSWORD',
        });
      }

      const result = await authService.resetPassword({ token, newPassword });

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === 'INVALID_OR_EXPIRED_TOKEN') {
        return res.status(400).json({
          success: false,
          message: 'Lien de réinitialisation invalide ou expiré.',
          error: 'INVALID_OR_EXPIRED_TOKEN',
        });
      }
      next(error);
    }
  },
};

export default authController;
