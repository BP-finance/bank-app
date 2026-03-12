/**
 * Tipos do módulo de autenticação
 */

import type { AuthenticatedUser } from "./auth-session.types";

export type { PersonType, RegisterResponse } from "./registration";
export type { OnboardingStatus } from "./onboarding-status.types";
export type { RegisterPFRequest } from "./register-pf.types";
export type { RegisterPJRequest } from "./register-pj.types";
export type { LoginRequest } from "./login.types";
export type { ForgotPasswordRequest } from "./forgot-password.types";
export type {
  RefreshResult,
  RefreshSuccess,
  RefreshFailure,
} from "./refresh-token.types";
export type {
  AuthSession,
  AuthenticatedUser,
  AuthUser,
} from "./auth-session.types";

/** @deprecated Use AuthSession. Mantido para compatibilidade com shared/api */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  user: AuthenticatedUser;
}

/** @deprecated Mantido para compatibilidade com shared/api */
export interface ForgotPasswordResponse {
  message: string;
}
