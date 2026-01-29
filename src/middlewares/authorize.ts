import { Request, Response, NextFunction } from 'express';
import { UserType } from '@prisma/client';

/**
 * Middleware d'autorisation par rôle
 * @param allowedRoles - Liste des rôles autorisés
 */
export const authorize = (...allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Non authentifié',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.userType)) {
      res.status(403).json({
        success: false,
        message: 'Accès non autorisé pour ce rôle',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
};

/**
 * Raccourcis pour les rôles courants
 */
export const isAdmin = authorize(UserType.ADMIN);
export const isFreelance = authorize(UserType.FREELANCE);
export const isEntreprise = authorize(UserType.ENTREPRISE);
export const isFreelanceOrEntreprise = authorize(UserType.FREELANCE, UserType.ENTREPRISE);
export const isAdminOrEntreprise = authorize(UserType.ADMIN, UserType.ENTREPRISE);
