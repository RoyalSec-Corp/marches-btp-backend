import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// Singleton pour le client Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Fonction pour tester la connexion
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Base de données connectée');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Fonction pour déconnecter proprement
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('📤 Base de données déconnectée');
}
