import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { REGEX, ERROR_MESSAGES } from '../utils/constants.js';

// Middleware pour traiter les erreurs de validation
export function handleValidation(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: 'path' in error ? error.path : 'unknown',
      message: error.msg,
    }));

    res.status(422).json({
      success: false,
      error: {
        message: 'Erreur de validation',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
      },
    });
    return;
  }

  next();
}

// Wrapper pour appliquer les validations + handler
export function validate(validations: ValidationChain[]) {
  return [...validations, handleValidation];
}

// ============================================
// VALIDATEURS RÉUTILISABLES
// ============================================

// Email
export const emailValidator = body('email')
  .trim()
  .notEmpty()
  .withMessage(ERROR_MESSAGES.REQUIRED_FIELD)
  .isEmail()
  .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
  .normalizeEmail();

// Mot de passe
export const passwordValidator = body('password')
  .notEmpty()
  .withMessage(ERROR_MESSAGES.REQUIRED_FIELD)
  .isLength({ min: 8 })
  .withMessage('Le mot de passe doit faire au moins 8 caractères')
  .matches(REGEX.PASSWORD)
  .withMessage(ERROR_MESSAGES.INVALID_PASSWORD);

// SIRET
export const siretValidator = body('siret')
  .trim()
  .notEmpty()
  .withMessage(ERROR_MESSAGES.REQUIRED_FIELD)
  .matches(REGEX.SIRET)
  .withMessage(ERROR_MESSAGES.INVALID_SIRET);

// Code postal
export const codePostalValidator = body('codePostal')
  .trim()
  .notEmpty()
  .withMessage(ERROR_MESSAGES.REQUIRED_FIELD)
  .matches(REGEX.CODE_POSTAL)
  .withMessage('Code postal invalide (5 chiffres)');

// Téléphone
export const telephoneValidator = body('telephone')
  .optional()
  .trim()
  .matches(REGEX.TELEPHONE)
  .withMessage('Numéro de téléphone invalide');

// ID en paramètre URL
export const idParamValidator = param('id')
  .isInt({ min: 1 })
  .withMessage('ID invalide')
  .toInt();

// Pagination
export const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide (1-100)').toInt(),
];

// String requis
export const requiredString = (field: string, label: string) =>
  body(field).trim().notEmpty().withMessage(`${label} est requis`);

// String optionnel
export const optionalString = (field: string) => body(field).optional().trim();

// Nombre requis
export const requiredNumber = (field: string, label: string, options?: { min?: number; max?: number }) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} est requis`)
    .isNumeric()
    .withMessage(`${label} doit être un nombre`)
    .custom((value) => {
      const num = Number(value);
      if (options?.min !== undefined && num < options.min) {
        throw new Error(`${label} doit être au moins ${options.min}`);
      }
      if (options?.max !== undefined && num > options.max) {
        throw new Error(`${label} doit être au maximum ${options.max}`);
      }
      return true;
    });

// ============================================
// VALIDATIONS PAR ENTITÉ
// ============================================

// Inscription utilisateur de base
export const registerValidation = validate([
  emailValidator,
  passwordValidator,
  body('userType')
    .notEmpty()
    .withMessage('Type d\'utilisateur requis')
    .isIn(['FREELANCE', 'ENTREPRISE', 'APPEL_OFFRE'])
    .withMessage('Type d\'utilisateur invalide'),
]);

// Connexion
export const loginValidation = validate([
  body('email').trim().notEmpty().withMessage('Email requis').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
]);

// Profil freelance
export const freelanceValidation = validate([
  requiredString('nom', 'Nom'),
  requiredString('prenom', 'Prénom'),
  siretValidator,
  requiredString('secteur', 'Secteur d\'activité'),
  requiredNumber('dailyRate', 'Tarif journalier', { min: 0 }),
  requiredString('adresse', 'Adresse'),
  requiredString('ville', 'Ville'),
  codePostalValidator,
  telephoneValidator,
]);

// Profil entreprise
export const entrepriseValidation = validate([
  requiredString('nomEntreprise', 'Nom de l\'entreprise'),
  siretValidator,
  body('nafCode')
    .optional()
    .trim()
    .matches(REGEX.NAF)
    .withMessage('Code NAF invalide (ex: 4120A)'),
  requiredString('adresse', 'Adresse'),
  requiredString('ville', 'Ville'),
  codePostalValidator,
  telephoneValidator,
]);
