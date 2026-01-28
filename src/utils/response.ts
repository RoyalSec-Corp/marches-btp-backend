import { Response } from 'express';

// Interface pour les réponses API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Réponse de succès
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
}

// Réponse de succès avec pagination
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response {
  const totalPages = Math.ceil(total / limit);
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
  return res.status(200).json(response);
}

// Réponse de création
export function sendCreated<T>(res: Response, data: T, message: string = 'Ressource créée'): Response {
  return sendSuccess(res, data, message, 201);
}

// Réponse sans contenu
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

// Réponse d'erreur
export function sendError(
  res: Response,
  message: string,
  code: string = 'ERROR',
  statusCode: number = 400,
  details?: unknown
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
  return res.status(statusCode).json(response);
}

// Erreurs prédéfinies
export const errors = {
  badRequest: (res: Response, message: string = 'Requête invalide', details?: unknown) =>
    sendError(res, message, 'BAD_REQUEST', 400, details),

  unauthorized: (res: Response, message: string = 'Non autorisé') =>
    sendError(res, message, 'UNAUTHORIZED', 401),

  forbidden: (res: Response, message: string = 'Accès interdit') =>
    sendError(res, message, 'FORBIDDEN', 403),

  notFound: (res: Response, message: string = 'Ressource non trouvée') =>
    sendError(res, message, 'NOT_FOUND', 404),

  conflict: (res: Response, message: string = 'Conflit de données') =>
    sendError(res, message, 'CONFLICT', 409),

  validation: (res: Response, message: string = 'Erreur de validation', details?: unknown) =>
    sendError(res, message, 'VALIDATION_ERROR', 422, details),

  internal: (res: Response, message: string = 'Erreur interne du serveur') =>
    sendError(res, message, 'INTERNAL_ERROR', 500),
};
