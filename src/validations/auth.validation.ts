import { z } from 'zod';

// ===== Schemas de validation =====

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email requis' })
      .email('Email invalide')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Mot de passe requis' })
      .min(1, 'Mot de passe requis'),
  }),
});

export const registerFreelanceSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email requis' })
      .email('Email invalide')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Mot de passe requis' })
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    nom: z
      .string({ required_error: 'Nom requis' })
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: z
      .string({ required_error: 'Prénom requis' })
      .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    telephone: z.string().optional(),
    metier: z
      .string({ required_error: 'Métier requis' })
      .min(2, 'Le métier doit contenir au moins 2 caractères'),
    tarif: z
      .number({ required_error: 'Tarif requis' })
      .positive('Le tarif doit être positif'),
    modeTarification: z.enum(['JOUR', 'HEURE', 'FORFAIT']).default('JOUR'),
    siret: z
      .string()
      .regex(/^[0-9]{14}$/, 'Le SIRET doit contenir 14 chiffres')
      .optional(),
    experienceYears: z.number().int().min(0).optional(),
    description: z.string().max(2000).optional(),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    codePostal: z
      .string()
      .regex(/^[0-9]{5}$/, 'Code postal invalide')
      .optional(),
  }),
});

export const registerEntrepriseSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email requis' })
      .email('Email invalide')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Mot de passe requis' })
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    raisonSociale: z
      .string({ required_error: 'Raison sociale requise' })
      .min(2, 'La raison sociale doit contenir au moins 2 caractères'),
    siret: z
      .string({ required_error: 'SIRET requis' })
      .regex(/^[0-9]{14}$/, 'Le SIRET doit contenir 14 chiffres'),
    telephone: z.string().optional(),
    secteurActivite: z.string().optional(),
    tailleEntreprise: z.string().optional(),
    typePersonne: z.enum(['PARTICULIER', 'PROFESSIONNEL']).default('PROFESSIONNEL'),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    codePostal: z
      .string()
      .regex(/^[0-9]{5}$/, 'Code postal invalide')
      .optional(),
    nomContact: z.string().optional(),
    prenomContact: z.string().optional(),
    emailContact: z.string().email('Email contact invalide').optional(),
    telephoneContact: z.string().optional(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token requis' }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email requis' })
      .email('Email invalide')
      .toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'Token requis' }),
    password: z
      .string({ required_error: 'Mot de passe requis' })
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
  }),
});

// Types inférés
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterFreelanceInput = z.infer<typeof registerFreelanceSchema>['body'];
export type RegisterEntrepriseInput = z.infer<typeof registerEntrepriseSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
