import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

// Import des routes
import authRoutes from './routes/auth.routes.js';

// Creer l'application Express
const app: Application = express();

// ===== MIDDLEWARES DE SECURITE =====
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { 
    error: 'Trop de requetes, veuillez reessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ===== MIDDLEWARES DE PARSING =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== LOGGING =====
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ===== ROUTES API =====
app.use('/api/auth', authRoutes);

// TODO: Sprint 4 - Ajouter les autres routes
// app.use('/api/users', userRoutes);
// app.use('/api/freelances', freelanceRoutes);
// app.use('/api/entreprises', entrepriseRoutes);
// app.use('/api/contrats', contratRoutes);
// app.use('/api/appels-offres', appelOffreRoutes);
// app.use('/api/notifications', notificationRoutes);

// ===== ROUTE HEALTH CHECK =====
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// ===== ROUTE RACINE =====
app.get('/', (_req, res) => {
  res.json({
    name: 'Marches BTP API',
    version: '2.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      health: '/health',
    },
  });
});

// ===== GESTION DES ERREURS =====
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
