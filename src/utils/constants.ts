// Types d'utilisateurs
export const USER_TYPES = {
  FREELANCE: 'FREELANCE',
  ENTREPRISE: 'ENTREPRISE',
  APPEL_OFFRE: 'APPEL_OFFRE',
  ADMIN: 'ADMIN',
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

// Statuts des contrats
export const CONTRAT_STATUS = {
  BROUILLON: 'BROUILLON',
  EN_ATTENTE: 'EN_ATTENTE',
  SIGNE: 'SIGNE',
  EN_COURS: 'EN_COURS',
  TERMINE: 'TERMINE',
  ANNULE: 'ANNULE',
} as const;

export type ContratStatus = (typeof CONTRAT_STATUS)[keyof typeof CONTRAT_STATUS];

// Types de notifications
export const NOTIFICATION_TYPES = {
  CONTRAT: 'CONTRAT',
  MESSAGE: 'MESSAGE',
  APPEL_OFFRE: 'APPEL_OFFRE',
  SYSTEME: 'SYSTEME',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// Secteurs BTP
export const SECTEURS_BTP = [
  'Gros œuvre',
  'Second œuvre',
  'Électricité',
  'Plomberie',
  'Chauffage / Climatisation',
  'Menuiserie',
  'Carrelage',
  'Peinture',
  'Maçonnerie',
  'Couverture / Toiture',
  'Isolation',
  'Plâtrerie',
  'Serrurerie',
  'Vitrerie',
  'Terrassement',
  'VRD (Voirie et Réseaux Divers)',
  'Démolition',
  'Charpente',
  'Étanchéité',
  'Façade',
  'Aménagement intérieur',
  'Domotique',
  'Énergies renouvelables',
  'Autres',
] as const;

export type SecteurBTP = (typeof SECTEURS_BTP)[number];

// Expressions régulières de validation
export const REGEX = {
  // SIRET : 14 chiffres
  SIRET: /^[0-9]{14}$/,
  // SIREN : 9 chiffres
  SIREN: /^[0-9]{9}$/,
  // Code NAF/APE : 4 chiffres + 1 lettre
  NAF: /^[0-9]{4}[A-Z]$/,
  // Code postal français : 5 chiffres
  CODE_POSTAL: /^[0-9]{5}$/,
  // Téléphone français
  TELEPHONE: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  // Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Mot de passe : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Limites et valeurs par défaut
export const LIMITS = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  // Uploads
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],

  // Auth
  PASSWORD_MIN_LENGTH: 8,
  SESSION_DURATION_DAYS: 7,
  TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,

  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_BLOCK_DURATION_MINUTES: 15,
};

// Messages d'erreur standards
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
  SIRET_ALREADY_EXISTS: 'Ce SIRET est déjà enregistré',
  INVALID_TOKEN: 'Token invalide ou expiré',
  SESSION_EXPIRED: 'Session expirée, veuillez vous reconnecter',
  ACCOUNT_DISABLED: 'Ce compte a été désactivé',

  // Validation
  REQUIRED_FIELD: 'Ce champ est requis',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_SIRET: 'Numéro SIRET invalide (14 chiffres)',
  INVALID_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',

  // Ressources
  NOT_FOUND: 'Ressource non trouvée',
  FORBIDDEN: "Vous n'avez pas les droits pour effectuer cette action",
  CONFLICT: 'Cette ressource existe déjà',

  // Serveur
  INTERNAL_ERROR: 'Une erreur interne est survenue',
  SERVICE_UNAVAILABLE: 'Service temporairement indisponible',
};
