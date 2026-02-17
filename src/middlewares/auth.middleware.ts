import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

// Type pour les requêtes authentifiées
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userId: number; // alias pour compatibilité
    email: string;
    userType: string;
  };
}

// Etendre le type Request pour inclure user

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: number;
        userId: number;
        email: string;
        userType: string;
      };
    }
  }
}

/**
 * Middleware d'authentification JWT
 * Verifie le token dans le header Authorization
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification requis.",
        error: 'MISSING_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = authService.verifyAccessToken(token);
      // Normaliser: utiliser id ET userId pour compatibilité
      req.user = {
        id: payload.userId,
        userId: payload.userId,
        email: payload.email,
        userType: payload.userType,
      };
      next();
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expire.',
        error: 'INVALID_TOKEN',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware optionnel d'authentification
 * Ne bloque pas si pas de token, mais ajoute user si present
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = authService.verifyAccessToken(token);
        req.user = {
          id: payload.userId,
          userId: payload.userId,
          email: payload.email,
          userType: payload.userType,
        };
      } catch {
        // Token invalide, on continue sans user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware de verification du type d'utilisateur
 * @param allowedTypes - Types d'utilisateurs autorises
 */
export const requireUserType = (...allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifie.',
        error: 'UNAUTHORIZED',
      });
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Acces non autorise pour ce type de compte.',
        error: 'FORBIDDEN',
      });
    }

    next();
  };
};

/**
 * Middleware pour les admins uniquement
 */
export const requireAdmin = requireUserType('ADMIN');

/**
 * Middleware pour les freelances uniquement
 */
export const requireFreelance = requireUserType('FREELANCE');

/**
 * Middleware pour les entreprises uniquement
 */
export const requireEntreprise = requireUserType('ENTREPRISE');

/**
 * Middleware pour freelances et entreprises
 */
export const requireFreelanceOrEntreprise = requireUserType('FREELANCE', 'ENTREPRISE');
