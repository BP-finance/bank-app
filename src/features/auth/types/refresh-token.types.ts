/**
 * Tipos do fluxo de refresh token.
 * Preparado para integração futura com datasource/endpoint real.
 */

import type { AuthError } from "../errors";

/**
 * Resultado de sucesso do refresh.
 */
export interface RefreshSuccess {
  success: true;
  accessToken: string;
  refreshToken: string;
  /** Timestamp (ms) em que o novo access token expira (opcional) */
  expiresAt?: number;
}

/**
 * Resultado de falha do refresh.
 */
export interface RefreshFailure {
  success: false;
  error: AuthError;
}

/**
 * Resultado tipado da operação de refresh.
 * Permite tratamento discriminado por success.
 */
export type RefreshResult = RefreshSuccess | RefreshFailure;
