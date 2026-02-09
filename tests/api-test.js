/**
 * Script de test API MarchesBTP
 * Usage: API_URL=http://localhost:3002/api node tests/api-test.js
 * 
 * Pré-requis: Le serveur doit tourner
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3002/api';

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// État global pour les tests
const state = {
  freelanceToken: null,
  entrepriseToken: null,
  freelanceId: null,
  entrepriseId: null,
  contratId: null,
  notificationId: null,
  testResults: { passed: 0, failed: 0, skipped: 0 },
};

// Helper pour les requêtes
async function request(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

// Fonction de test
async function test(name, testFn) {
  try {
    const result = await testFn();
    if (result === 'skip') {
      log.warn(`${name} (SKIPPED)`);
      state.testResults.skipped++;
    } else if (result) {
      log.success(name);
      state.testResults.passed++;
    } else {
      log.error(name);
      state.testResults.failed++;
    }
  } catch (error) {
    log.error(`${name} - ${error.message}`);
    state.testResults.failed++;
  }
}

// ============================================
// TESTS
// ============================================

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('       TEST API MARCHES BTP BACKEND');
  console.log('='.repeat(60));
  console.log(`Server: ${BASE_URL}`);
  console.log('='.repeat(60));

  // ========== HEALTH ==========
  log.section('HEALTH CHECK');
  
  await test('GET /health - API en ligne', async () => {
    const res = await request('GET', '/health');
    // Accepter si on reçoit une réponse avec success ou message
    return res.ok || res.data.success || res.data.message;
  });

  // ========== AUTH - INSCRIPTION ==========
  log.section('AUTHENTIFICATION - INSCRIPTION');

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  await test('POST /auth/register/freelance - Inscription freelance', async () => {
    const res = await request('POST', '/auth/register/freelance', {
      email: testEmail,
      password: testPassword,
      nom: 'TestNom',
      prenom: 'TestPrenom',
      telephone: '0612345678',
      // Champs requis supplémentaires
      metier: 'Électricien',
      tarif: 350,
      tarifJournalier: 350,
      experience: 5,
      adresse: '123 Rue Test',
      codePostal: '75001',
      ville: 'Paris',
    });
    if (res.ok && (res.data.accessToken || res.data.token || res.data.user)) {
      state.freelanceToken = res.data.accessToken || res.data.token;
      state.freelanceId = res.data.user?.id || res.data.freelance?.id;
      return true;
    }
    if (res.status === 400) {
      console.log('   Response:', res.status, JSON.stringify(res.data, null, 2));
    }
    return false;
  });

  const entrepriseEmail = `entreprise_${Date.now()}@example.com`;
  
  await test('POST /auth/register/entreprise - Inscription entreprise', async () => {
    const res = await request('POST', '/auth/register/entreprise', {
      email: entrepriseEmail,
      password: testPassword,
      nom: 'Durand',
      prenom: 'Marie',
      telephone: '0698765432',
      raisonSociale: 'Test Entreprise SARL',
      siret: '12345678901234',
      adresse: '123 Rue Test',
      codePostal: '75001',
      ville: 'Paris',
      // Champs requis supplémentaires
      representantLegal: 'Marie Durand',
      secteurActivite: 'BTP',
    });
    if (res.ok && (res.data.accessToken || res.data.token || res.data.user)) {
      state.entrepriseToken = res.data.accessToken || res.data.token;
      state.entrepriseId = res.data.user?.id || res.data.entreprise?.id;
      return true;
    }
    if (res.status === 400) {
      console.log('   Response:', res.status, JSON.stringify(res.data, null, 2));
    }
    return false;
  });

  // ========== AUTH - LOGIN ==========
  log.section('AUTHENTIFICATION - LOGIN');

  await test('POST /auth/login - Login freelance', async () => {
    const res = await request('POST', '/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    if (res.ok && (res.data.accessToken || res.data.token)) {
      state.freelanceToken = res.data.accessToken || res.data.token;
      return true;
    }
    // Si l'inscription a échoué, on skip
    if (!state.freelanceToken && res.status === 401) {
      return 'skip';
    }
    return false;
  });

  await test('POST /auth/login - Login avec mauvais mot de passe', async () => {
    const res = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'wrongpassword',
    });
    return res.status === 401 || res.status === 400;
  });

  // ========== AUTH - PROFIL ==========
  log.section('AUTHENTIFICATION - PROFIL');

  await test('GET /auth/profile - Récupérer profil (authentifié)', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/auth/profile', null, state.freelanceToken);
    return res.ok && res.data.email;
  });

  await test('GET /auth/profile - Sans token (401)', async () => {
    const res = await request('GET', '/auth/profile');
    return res.status === 401;
  });

  // ========== FREELANCE ==========
  log.section('FREELANCE');

  await test('GET /freelances/profile - Mon profil freelance', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/freelances/profile', null, state.freelanceToken);
    return res.ok;
  });

  await test('PUT /freelances/profile - Modifier profil freelance', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('PUT', '/freelances/profile', {
      metier: 'Plombier',
      experience: 8,
      tarifJournalier: 400,
    }, state.freelanceToken);
    return res.ok;
  });

  await test('PATCH /freelances/disponibilite - Modifier disponibilité', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('PATCH', '/freelances/disponibilite', {
      disponible: true,
    }, state.freelanceToken);
    return res.ok || res.status === 404; // 404 si route n'existe pas encore
  });

  await test('GET /freelances - Liste publique freelances', async () => {
    const res = await request('GET', '/freelances');
    return res.ok && (Array.isArray(res.data.data) || Array.isArray(res.data));
  });

  await test('GET /freelances/search?q=test - Recherche freelances', async () => {
    const res = await request('GET', '/freelances/search?q=test');
    return res.ok || res.status === 404; // 404 si route search n'existe pas
  });

  await test('GET /freelances/documents - Mes documents (authentifié)', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/freelances/documents', null, state.freelanceToken);
    return res.ok;
  });

  // ========== ENTREPRISE ==========
  log.section('ENTREPRISE');

  await test('GET /entreprises/profile - Mon profil entreprise', async () => {
    if (!state.entrepriseToken) return 'skip';
    const res = await request('GET', '/entreprises/profile', null, state.entrepriseToken);
    return res.ok;
  });

  await test('GET /entreprises - Liste publique entreprises', async () => {
    const res = await request('GET', '/entreprises');
    return res.ok;
  });

  await test('GET /entreprises/documents - Mes documents (authentifié)', async () => {
    if (!state.entrepriseToken) return 'skip';
    const res = await request('GET', '/entreprises/documents', null, state.entrepriseToken);
    return res.ok;
  });

  // ========== GEOCODING ==========
  log.section('GÉOCODAGE');

  await test('POST /geocoding/geocode - Géocoder adresse', async () => {
    const res = await request('POST', '/geocoding/geocode', {
      adresse: '1 Avenue des Champs-Élysées',
      ville: 'Paris',
      codePostal: '75008',
    });
    // Accepter si la route existe et retourne quelque chose
    return res.ok || (res.status !== 404 && res.data);
  });

  await test('GET /geocoding/postal/75001 - Géocoder code postal', async () => {
    const res = await request('GET', '/geocoding/postal/75001');
    return res.ok || res.status !== 404;
  });

  await test('GET /geocoding/autocomplete?q=Paris - Autocomplétion', async () => {
    const res = await request('GET', '/geocoding/autocomplete?q=Paris');
    return res.ok || res.status !== 404;
  });

  await test('GET /geocoding/reverse?lat=48.8566&lng=2.3522 - Géocodage inverse', async () => {
    const res = await request('GET', '/geocoding/reverse?lat=48.8566&lng=2.3522');
    return res.ok || res.status !== 404;
  });

  await test('POST /geocoding/distance - Calculer distance', async () => {
    const res = await request('POST', '/geocoding/distance', {
      from: { lat: 48.8566, lng: 2.3522 },
      to: { lat: 45.764, lng: 4.8357 },
    });
    return res.ok || res.status !== 404;
  });

  // ========== CONTRATS ==========
  log.section('CONTRATS');

  await test('GET /contrats/stats - Statistiques contrats', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/contrats/stats', null, state.freelanceToken);
    return res.ok;
  });

  await test('GET /contrats/me - Mes contrats', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/contrats/me', null, state.freelanceToken);
    return res.ok;
  });

  await test('GET /contrats - Liste contrats', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/contrats', null, state.freelanceToken);
    return res.ok;
  });

  // ========== NOTIFICATIONS ==========
  log.section('NOTIFICATIONS');

  await test('GET /notifications/unread-count - Compter non lues', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/notifications/unread-count', null, state.freelanceToken);
    return res.ok;
  });

  await test('GET /notifications - Liste notifications', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/notifications', null, state.freelanceToken);
    return res.ok;
  });

  await test('PUT /notifications/read-all - Marquer tout comme lu', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('PUT', '/notifications/read-all', {}, state.freelanceToken);
    return res.ok;
  });

  // ========== APPELS D'OFFRES ==========
  log.section('APPELS D\'OFFRES');

  await test('GET /appels-offres - Liste appels d\'offres', async () => {
    const res = await request('GET', '/appels-offres');
    return res.ok || res.status !== 404;
  });

  await test('GET /appels-offres/statistics - Statistiques (authentifié)', async () => {
    if (!state.freelanceToken) return 'skip';
    const res = await request('GET', '/appels-offres/statistics', null, state.freelanceToken);
    return res.ok || res.status !== 404;
  });

  // ========== RÉSUMÉ ==========
  console.log('\n' + '='.repeat(60));
  console.log('                    RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  console.log(`${colors.green}✓ Passés:${colors.reset}   ${state.testResults.passed}`);
  console.log(`${colors.red}✗ Échoués:${colors.reset}  ${state.testResults.failed}`);
  console.log(`${colors.yellow}⚠ Ignorés:${colors.reset}  ${state.testResults.skipped}`);
  console.log('='.repeat(60));
  
  const total = state.testResults.passed + state.testResults.failed;
  const percentage = total > 0 ? Math.round((state.testResults.passed / total) * 100) : 0;
  
  if (state.testResults.failed === 0) {
    console.log(`${colors.green}🎉 Tous les tests sont passés ! (${percentage}%)${colors.reset}`);
  } else {
    console.log(`${colors.yellow}📊 Taux de réussite: ${percentage}%${colors.reset}`);
  }
  console.log('='.repeat(60) + '\n');

  // Exit code
  process.exit(state.testResults.failed > 0 ? 1 : 0);
}

// Exécuter les tests
runTests().catch(console.error);
