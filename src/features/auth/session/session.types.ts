/**
 * Tipos específicos da camada session.
 * Usados internamente pelo sessionManager, sessionStorage e sessionHydrator.
 */

import type { AuthSession } from "../types/auth-session.types";

/**
 * Tokens armazenados no storage seguro.
 * Estrutura preparada para suporte futuro a expiresAt.
 */
export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt?: number;
}

/**
 * Payload para persistir tokens.
 * Usado pelo sessionStorage.saveTokens().
 */
export interface TokensPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

/**
 * Códigos de erro da camada session.
 */
export enum SessionErrorCode {
  NO_STORED_TOKENS = "NO_STORED_TOKENS",
  HYDRATION_FAILED = "HYDRATION_FAILED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  STORAGE_ERROR = "STORAGE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Erro tipado da camada session.
 */
export interface SessionError {
  code: SessionErrorCode;
  message: string;
  originalError?: unknown;
}

/**
 * Resultado da operação de restauração de sessão.
 * Sempre retorna um objeto tipado, nunca null diretamente.
 */
export interface SessionRestoreResult {
  success: boolean;
  session: AuthSession | null;
  error?: SessionError;
}

/**
 * Resultado da operação de limpeza de sessão.
 */
export interface SessionClearResult {
  success: boolean;
  apiLogoutSuccess: boolean;
  error?: SessionError;
}

/**
 * Resultado da hidratação de sessão.
 */
export interface SessionHydrateResult {
  success: boolean;
  session: AuthSession | null;
  error?: SessionError;
}
