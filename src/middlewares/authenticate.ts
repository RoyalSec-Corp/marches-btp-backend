import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { JwtPayload } from '../types/auth.types.js';

/**
 * Middleware d'authentification JWT
 * Vérifie le token dans le header Authorization
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupérer le token du header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const payload = authService.verifyAccessToken(token);

    // Ajouter les infos utilisateur à la requête
    req.user = payload as JwtPayload;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Token invalide',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Erreur d\'authentification',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Middleware optionnel - ne bloque pas si pas de token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = authService.verifyAccessToken(token);
      req.user = payload as JwtPayload;
    }

    next();
  } catch {
    // Token invalide mais on continue quand même
    next();
  }
};
