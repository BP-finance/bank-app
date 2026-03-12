/**
 * Tipos e classe de erro do módulo AUTH.
 * AuthError estende Error para compatibilidade com try/catch padrão.
 */

/**
 * Códigos de erro de autenticação.
 * Baseado no auth-architecture-context.md + necessidades reais.
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  ACCOUNT_BLOCKED = "ACCOUNT_BLOCKED",
  ACCOUNT_PENDING = "ACCOUNT_PENDING",
  DOCUMENTS_REQUIRED = "DOCUMENTS_REQUIRED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  NETWORK_ERROR = "NETWORK_ERROR",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Detalhes opcionais do erro.
 */
export interface AuthErrorDetails {
  field?: string;
  context?: string;
  [key: string]: unknown;
}

/**
 * Classe de erro de autenticação.
 * Estende Error para funcionar com try/catch padrão.
 * Permite acesso ao código tipado para lógica condicional na UI.
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly originalMessage?: string;
  readonly originalError?: unknown;
  readonly details?: AuthErrorDetails;

  constructor(
    code: AuthErrorCode,
    message: string,
    options?: {
      originalMessage?: string;
      originalError?: unknown;
      details?: AuthErrorDetails;
    }
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.originalMessage = options?.originalMessage;
    this.originalError = options?.originalError;
    this.details = options?.details;

    Object.setPrototypeOf(this, AuthError.prototype);
  }

  /**
   * Verifica se um erro é AuthError.
   */
  static isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }

  /**
   * Converte para objeto serializável (útil para logs/analytics).
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      originalMessage: this.originalMessage,
      details: this.details,
    };
  }
}

/**
 * Resultado tipado para operações de auth que podem falhar.
 */
export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: AuthError;
}
