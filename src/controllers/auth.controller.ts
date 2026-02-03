import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export const authController = {
  // POST /api/auth/register/freelance
  registerFreelance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.registerFreelance(req.body);

      res.status(201).json({
        success: true,
        message: 'Inscription reussie. Votre compte est en attente de validation.',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Cet email est deja utilise.',
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
        message: 'Inscription reussie. Votre compte est en attente de validation.',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Cet email est deja utilise.',
          error: 'EMAIL_ALREADY_EXISTS',
        });
      }
      next(error);
    }
  },

  // POST /api/auth/register_appel_offre
  registerAppelOffre: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.registerAppelOffre(req.body);

      res.status(201).json({
        success: true,
        message: "Inscription reussie. Vous pouvez maintenant publier des appels d'offres.",
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Cet email est deja utilise.',
          error: 'EMAIL_ALREADY_EXISTS',
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
        message: 'Connexion reussie.',
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
          message: 'Votre compte a ete desactive.',
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
        message: 'Deconnexion reussie.',
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
        message: 'Tokens rafraichis.',
        data: tokens,
      });
    } catch (error: any) {
      if (error.message === 'SESSION_EXPIRED' || error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Session expiree. Veuillez vous reconnecter.',
          error: 'SESSION_EXPIRED',
        });
      }
      next(error);
    }
  },

  // GET /api/auth/profile
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifie.',
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
          message: 'Utilisateur non trouve.',
          error: 'USER_NOT_FOUND',
        });
      }
      next(error);
    }
  },

  // GET /api/auth/verify
  verifyToken: async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifie.',
          error: 'UNAUTHORIZED',
        });
      }

      const user = await authService.verifyToken(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.',
        error: 'INVALID_TOKEN',
      });
    }
  },
};

export default authController;
