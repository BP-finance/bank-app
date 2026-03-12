/**
 * Factory para criar instâncias de AuthError.
 * Fornece atalhos para erros comuns com mensagens padronizadas.
 */

import { AuthError, AuthErrorCode, AuthErrorDetails } from "./auth-error.types";
import { getAuthErrorMessage } from "./auth-error.messages";

/**
 * Cria AuthError a partir de um código.
 * Usa mensagem padrão do código, mas permite customização.
 */
export function createAuthError(
  code: AuthErrorCode,
  options?: {
    message?: string;
    originalMessage?: string;
    originalError?: unknown;
    details?: AuthErrorDetails;
  }
): AuthError {
  const message = options?.message ?? getAuthErrorMessage(code);
  return new AuthError(code, message, {
    originalMessage: options?.originalMessage,
    originalError: options?.originalError,
    details: options?.details,
  });
}

/**
 * Factory com atalhos para erros comuns.
 */
export const authErrorFactory = {
  /**
   * Erro de credenciais inválidas (login).
   */
  invalidCredentials(originalError?: unknown): AuthError {
    return createAuthError(AuthErrorCode.INVALID_CREDENTIALS, {
      originalError,
    });
  },

  /**
   * Erro de conta bloqueada.
   */
  accountBlocked(originalError?: unknown): AuthError {
    return createAuthError(AuthErrorCode.ACCOUNT_BLOCKED, {
      originalError,
    });
  },

  /**
   * Erro de conta pendente.
   */
  accountPending(originalError?: unknown): AuthError {
    return createAuthError(AuthErrorCode.ACCOUNT_PENDING, {
      originalError,
    });
  },

  /**
   * Erro de documentos pendentes.
   */
  documentsRequired(originalError?: unknown): AuthError {
    return createAuthError(AuthErrorCode.DOCUMENTS_REQUIRED, {
      originalError,
    });
  },

  /**
   * Erro de sessão expirada.
   */
  sessionExpired(originalError?: unknown): AuthError {
    return createAuthError(AuthErrorCode.SESSION_EXPIRED, {
      originalError,
    });
  },

  /**
   * Erro de rede.
   */
  networkError(originalError?: unknown): AuthError {
    return createAuthError(AuthErrorCode.NETWORK_ERROR, {
      originalError,
    });
  },

  /**
   * Erro de usuário não encontrado.
   */
  userNotFound(originalError?: unknown): AuthError {
    return createAuthError(AuthErrorCode.USER_NOT_FOUND, {
      originalError,
    });
  },

  /**
   * Erro desconhecido (fallback).
   */
  unknown(originalError?: unknown): AuthError {
    return createAuthError(AuthErrorCode.UNKNOWN_ERROR, {
      originalError,
    });
  },
};
