import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Helper pour gerer les erreurs de validation
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Donnees invalides.',
      errors: errors.array().map((err) => ({
        field: (err as any).path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation inscription Freelance
export const validateRegisterFreelance = [
  body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caracteres.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.'
    ),
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caracteres.'),
  body('prenom')
    .trim()
    .notEmpty()
    .withMessage('Le prenom est requis.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prenom doit contenir entre 2 et 50 caracteres.'),
  body('metier').trim().notEmpty().withMessage('Le metier est requis.'),
  body('tarif').isFloat({ min: 0 }).withMessage('Le tarif doit etre un nombre positif.'),
  body('telephone')
    .optional()
    .matches(/^(\+33|0)[1-9](\d{2}){4}$/)
    .withMessage('Numero de telephone invalide.'),
  body('siret')
    .optional()
    .matches(/^\d{14}$/)
    .withMessage('Le SIRET doit contenir 14 chiffres.'),
  handleValidationErrors,
];

// Validation inscription Entreprise
export const validateRegisterEntreprise = [
  body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caracteres.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.'
    ),
  body('raisonSociale')
    .trim()
    .notEmpty()
    .withMessage('La raison sociale est requise.')
    .isLength({ min: 2, max: 100 })
    .withMessage('La raison sociale doit contenir entre 2 et 100 caracteres.'),
  body('siret')
    .matches(/^\d{14}$/)
    .withMessage('Le SIRET doit contenir 14 chiffres.'),
  body('representantLegal')
    .trim()
    .notEmpty()
    .withMessage('Le nom du representant legal est requis.'),
  body('telephone')
    .optional()
    .matches(/^(\+33|0)[1-9](\d{2}){4}$/)
    .withMessage('Numero de telephone invalide.'),
  body('codePostal')
    .optional()
    .matches(/^\d{5}$/)
    .withMessage('Code postal invalide.'),
  body('formeJuridique').optional().trim(),
  handleValidationErrors,
];

// Validation connexion
export const validateLogin = [
  body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis.'),
  handleValidationErrors,
];
