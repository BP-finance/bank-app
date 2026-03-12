/**
 * Mapper de erros para AuthError.
 * Prioridade de mapeamento:
 * 1. Código estruturado (API real)
 * 2. Estrutura de resposta de erro (ApiErrorResponse)
 * 3. Mensagem de erro (fallback para mocks)
 *
 * Compatível com mocks atuais e preparado para API real.
 */

import type { ApiErrorResponse } from "../api/auth.api.types";
import { AuthError, AuthErrorCode } from "./auth-error.types";
import { createAuthError } from "./auth-error.factory";

/**
 * Mapeamento de códigos da API para AuthErrorCode.
 * Usado quando API retorna { error: { code: "..." } }.
 */
const API_CODE_MAP: Record<string, AuthErrorCode> = {
  INVALID_CREDENTIALS: AuthErrorCode.INVALID_CREDENTIALS,
  WRONG_PASSWORD: AuthErrorCode.INVALID_CREDENTIALS,
  WRONG_CREDENTIALS: AuthErrorCode.INVALID_CREDENTIALS,
  ACCOUNT_BLOCKED: AuthErrorCode.ACCOUNT_BLOCKED,
  ACCOUNT_LOCKED: AuthErrorCode.ACCOUNT_BLOCKED,
  ACCOUNT_PENDING: AuthErrorCode.ACCOUNT_PENDING,
  PENDING_APPROVAL: AuthErrorCode.ACCOUNT_PENDING,
  DOCUMENTS_REQUIRED: AuthErrorCode.DOCUMENTS_REQUIRED,
  DOCUMENTS_PENDING: AuthErrorCode.DOCUMENTS_REQUIRED,
  SESSION_EXPIRED: AuthErrorCode.SESSION_EXPIRED,
  TOKEN_EXPIRED: AuthErrorCode.SESSION_EXPIRED,
  TOKEN_INVALID: AuthErrorCode.SESSION_EXPIRED,
  UNAUTHORIZED: AuthErrorCode.SESSION_EXPIRED,
  USER_NOT_FOUND: AuthErrorCode.USER_NOT_FOUND,
  NOT_FOUND: AuthErrorCode.USER_NOT_FOUND,
  NETWORK_ERROR: AuthErrorCode.NETWORK_ERROR,
  CONNECTION_ERROR: AuthErrorCode.NETWORK_ERROR,
  TIMEOUT: AuthErrorCode.NETWORK_ERROR,
};

/**
 * Mapeamento de mensagens de erro para AuthErrorCode.
 * FALLBACK para compatibilidade com mocks que usam throw new Error("...").
 * Ordem de verificação: mais específico primeiro.
 */
const MESSAGE_PATTERNS: Array<{ pattern: RegExp; code: AuthErrorCode }> = [
  { pattern: /credenciais?\s+inv[áa]lid/i, code: AuthErrorCode.INVALID_CREDENTIALS },
  { pattern: /senha\s+(incorreta|inv[áa]lid)/i, code: AuthErrorCode.INVALID_CREDENTIALS },
  { pattern: /usu[áa]rio\s+n[ãa]o\s+encontrad/i, code: AuthErrorCode.USER_NOT_FOUND },
  { pattern: /conta\s+bloquead/i, code: AuthErrorCode.ACCOUNT_BLOCKED },
  { pattern: /conta\s+pendente/i, code: AuthErrorCode.ACCOUNT_PENDING },
  { pattern: /documentos?\s+pendente/i, code: AuthErrorCode.DOCUMENTS_REQUIRED },
  { pattern: /sess[ãa]o\s+(inv[áa]lid|expirad)/i, code: AuthErrorCode.SESSION_EXPIRED },
  { pattern: /token\s+(inv[áa]lid|expirad)/i, code: AuthErrorCode.SESSION_EXPIRED },
  { pattern: /conex[ãa]o|network|internet|timeout/i, code: AuthErrorCode.NETWORK_ERROR },
];

/**
 * Mapper de erros para AuthError.
 */
export const authErrorMapper = {
  /**
   * 1. Mapeia código de erro da API para AuthErrorCode.
   * Prioridade máxima - usado quando API retorna código estruturado.
   */
  fromApiCode(code: string): AuthErrorCode {
    const upperCode = code.toUpperCase();
    return API_CODE_MAP[upperCode] ?? AuthErrorCode.UNKNOWN_ERROR;
  },

  /**
   * 2. Mapeia resposta de erro da API para AuthError.
   * Usado quando API retorna { success: false, error: { code, message } }.
   */
  fromApiResponse(response: ApiErrorResponse): AuthError {
    const errorCode = this.fromApiCode(response.error.code);
    return createAuthError(errorCode, {
      originalMessage: response.error.message,
      details: response.error.details
        ? { apiDetails: response.error.details }
        : undefined,
    });
  },

  /**
   * 3. Mapeia mensagem de erro para AuthErrorCode.
   * FALLBACK - usado apenas quando não há código estruturado.
   * Compatível com mocks que usam throw new Error("mensagem").
   */
  fromMessage(message: string): AuthErrorCode {
    for (const { pattern, code } of MESSAGE_PATTERNS) {
      if (pattern.test(message)) {
        return code;
      }
    }
    return AuthErrorCode.UNKNOWN_ERROR;
  },

  /**
   * Mapeia qualquer erro para AuthError.
   * Ordem de prioridade:
   * 1. Se já é AuthError, retorna como está
   * 2. Se tem propriedade .code (API estruturada), usa fromApiCode
   * 3. Se é Error com .message, usa fromMessage (fallback para mocks)
   * 4. Caso contrário, retorna UNKNOWN_ERROR
   */
  fromError(error: unknown): AuthError {
    if (AuthError.isAuthError(error)) {
      return error;
    }

    if (this.isApiErrorResponse(error)) {
      return this.fromApiResponse(error);
    }

    if (this.hasErrorCode(error)) {
      const errorCode = this.fromApiCode(error.code);
      return createAuthError(errorCode, {
        originalMessage: error.message,
        originalError: error,
      });
    }

    if (error instanceof Error) {
      const errorCode = this.fromMessage(error.message);
      return createAuthError(errorCode, {
        originalMessage: error.message,
        originalError: error,
      });
    }

    if (typeof error === "string") {
      const errorCode = this.fromMessage(error);
      return createAuthError(errorCode, {
        originalMessage: error,
      });
    }

    return createAuthError(AuthErrorCode.UNKNOWN_ERROR, {
      originalError: error,
    });
  },

  /**
   * Type guard para verificar se é ApiErrorResponse.
   */
  isApiErrorResponse(value: unknown): value is ApiErrorResponse {
    return (
      typeof value === "object" &&
      value !== null &&
      "success" in value &&
      (value as Record<string, unknown>).success === false &&
      "error" in value &&
      typeof (value as Record<string, unknown>).error === "object"
    );
  },

  /**
   * Type guard para verificar se tem code e message.
   */
  hasErrorCode(value: unknown): value is { code: string; message?: string } {
    return (
      typeof value === "object" &&
      value !== null &&
      "code" in value &&
      typeof (value as Record<string, unknown>).code === "string"
    );
  },
};
