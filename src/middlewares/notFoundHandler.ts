import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      message: `Route non trouvée: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
  });
}
