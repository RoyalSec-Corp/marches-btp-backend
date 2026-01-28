import dotenv from 'dotenv';
import { z } from 'zod';

// Charger les variables d'environnement
dotenv.config();

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  // Serveur
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3002),

  // Base de données
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET doit faire au moins 32 caractères'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Sécurité
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Email (optionnel)
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().optional(),

  // URLs
  APP_URL: z.string().default('http://localhost:3000'),
  API_URL: z.string().default('http://localhost:3002'),
});

// Type inféré du schéma
export type Env = z.infer<typeof envSchema>;

// Valider et exporter la configuration
const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error('❌ Configuration invalide:\n' + errors);
    process.exit(1);
  }
  
  return result.data;
};

export const env = parseEnv();
