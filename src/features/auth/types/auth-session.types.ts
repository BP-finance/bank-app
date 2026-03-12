/**
 * Tipos de sessão autenticada.
 * Modelo interno conforme contrato do backend.
 */

import type { OnboardingStatus } from "./onboarding-status.types";

export interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  documento: string;
  tipoConta: "PF" | "PJ";
  onboardingStatus: OnboardingStatus;
}

/** @deprecated Use AuthenticatedUser */
export type AuthUser = AuthenticatedUser;

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: AuthenticatedUser;
  /** Timestamp (ms) em que o access token expira (opcional) */
  expiresAt?: number;
}
