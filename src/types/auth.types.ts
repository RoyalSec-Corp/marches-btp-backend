import { UserType } from '@prisma/client';

// ===== JWT Payload =====
export interface JwtPayload {
  userId: number;
  email: string;
  userType: UserType;
  iat?: number;
  exp?: number;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

// ===== Request DTOs =====
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterFreelanceDto {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  metier: string;
  tarif: number;
  modeTarification?: 'JOUR' | 'HEURE' | 'FORFAIT';
  siret?: string;
  experienceYears?: number;
  description?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
}

export interface RegisterEntrepriseDto {
  email: string;
  password: string;
  raisonSociale: string;
  siret: string;
  telephone?: string;
  secteurActivite?: string;
  tailleEntreprise?: string;
  typePersonne?: 'PARTICULIER' | 'PROFESSIONNEL';
  adresse?: string;
  ville?: string;
  codePostal?: string;
  nomContact?: string;
  prenomContact?: string;
  emailContact?: string;
  telephoneContact?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

// ===== Response DTOs =====
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserResponse;
    tokens: JwtTokens;
  };
}

export interface UserResponse {
  id: number;
  email: string;
  userType: UserType;
  nom?: string | null;
  prenom?: string | null;
  telephone?: string | null;
  isActive: boolean;
  createdAt: Date;
  freelance?: FreelanceResponse | null;
  entreprise?: EntrepriseResponse | null;
}

export interface FreelanceResponse {
  id: number;
  nom: string;
  prenom: string;
  metier: string;
  tarif: number;
  modeTarification: string;
  disponible: boolean;
  statutCompte: string;
}

export interface EntrepriseResponse {
  id: number;
  raisonSociale: string;
  siret: string;
  secteurActivite?: string | null;
  statutCompte: string;
}
