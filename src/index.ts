import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

// Démarrer le serveur
async function bootstrap(): Promise<void> {
  try {
    // Connexion à la base de données
    await connectDatabase();

    // Démarrer le serveur HTTP
    const server = app.listen(env.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 MARCHÉS BTP API                              ║
║                                                   ║
║   Environnement : ${env.NODE_ENV.padEnd(28)}║
║   Port         : ${String(env.PORT).padEnd(28)}║
║   URL          : ${env.API_URL.padEnd(28)}║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });

    // Gestion de l'arrêt gracieux
    const shutdown = async (signal: string) => {
      console.log(`\n📥 Signal ${signal} reçu. Arrêt en cours...`);

      server.close(async () => {
        await disconnectDatabase();
        console.log('👋 Serveur arrêté proprement');
        process.exit(0);
      });

      // Force l'arrêt après 10 secondes
      setTimeout(() => {
        console.error('⚠️ Arrêt forcé après timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

// Lancer l'application
bootstrap();
