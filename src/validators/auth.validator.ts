import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationError } from 'express-validator';

interface FieldValidationError extends ValidationError {
  path?: string;
}

// Helper pour gerer les erreurs de validation
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extraire les messages d'erreur pour un affichage simple
    const errorMessages = errors.array().map((err) => err.msg).join(' ');
    
    return res.status(400).json({
      success: false,
      message: errorMessages || 'Données invalides.',
      errors: errors.array().map((err) => ({
        field: (err as FieldValidationError).path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation inscription Freelance
export const validateRegisterFreelance = [
  body('email')
    .isEmail()
    .withMessage('Email invalide.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères.'),
  body('prenom')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères.'),
  body('metier')
    .trim()
    .notEmpty()
    .withMessage('Le métier est requis.'),
  body('tarif')
    .isFloat({ min: 0 })
    .withMessage('Le tarif doit être un nombre positif.'),
  body('telephone')
    .optional({ checkFalsy: true })
    .matches(/^[\d\s+()-]{10,20}$/)
    .withMessage('Numéro de téléphone invalide.'),
  body('siret')
    .optional({ checkFalsy: true })
    .matches(/^\d{14}$/)
    .withMessage('Le SIRET doit contenir 14 chiffres.'),
  handleValidationErrors,
];

// Validation inscription Entreprise
export const validateRegisterEntreprise = [
  body('email')
    .isEmail()
    .withMessage('Email invalide.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
  body('raisonSociale')
    .trim()
    .notEmpty()
    .withMessage('La raison sociale est requise.')
    .isLength({ min: 2, max: 100 })
    .withMessage('La raison sociale doit contenir entre 2 et 100 caractères.'),
  body('siret')
    .matches(/^\d{14}$/)
    .withMessage('Le SIRET doit contenir 14 chiffres.'),
  body('representantLegal')
    .trim()
    .notEmpty()
    .withMessage('Le nom du représentant légal est requis.'),
  body('telephone')
    .optional({ checkFalsy: true })
    .matches(/^[\d\s+()-]{10,20}$/)
    .withMessage('Numéro de téléphone invalide.'),
  body('codePostal')
    .optional({ checkFalsy: true })
    .matches(/^\d{5}$/)
    .withMessage('Code postal invalide (5 chiffres).'),
  body('formeJuridique')
    .optional({ checkFalsy: true })
    .trim(),
  body('nom')
    .optional({ checkFalsy: true })
    .trim(),
  body('prenom')
    .optional({ checkFalsy: true })
    .trim(),
  body('adresse')
    .optional({ checkFalsy: true })
    .trim(),
  body('ville')
    .optional({ checkFalsy: true })
    .trim(),
  body('secteurActivite')
    .optional({ checkFalsy: true })
    .trim(),
  handleValidationErrors,
];

// Validation connexion
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalide.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis.'),
  handleValidationErrors,
];
