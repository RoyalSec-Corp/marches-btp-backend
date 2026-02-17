import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

// Interface pour les erreurs personnalisées
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

// Classe d'erreur personnalisée
export class ApiError extends Error implements AppError {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // Erreurs prédéfinies courantes
  static badRequest(message: string = 'Requête invalide'): ApiError {
    return new ApiError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message: string = 'Non autorisé'): ApiError {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Accès interdit'): ApiError {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Ressource non trouvée'): ApiError {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string = 'Conflit de données'): ApiError {
    return new ApiError(message, 409, 'CONFLICT');
  }

  static validation(message: string = 'Erreur de validation'): ApiError {
    return new ApiError(message, 422, 'VALIDATION_ERROR');
  }

  static internal(message: string = 'Erreur interne du serveur'): ApiError {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }
}

// Middleware de gestion des erreurs
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log de l'erreur
  console.error('❌ Erreur:', {
    message: err.message,
    code: err.code,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Déterminer le code de statut
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Réponse JSON
  const response: Record<string, unknown> = {
    success: false,
    error: {
      message: err.isOperational ? err.message : 'Une erreur interne est survenue',
      code,
    },
  };

  // Ajouter la stack trace en développement
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
