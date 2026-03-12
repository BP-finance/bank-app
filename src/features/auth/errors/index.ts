/**
 * Camada de erros do módulo AUTH.
 * Fornece tipos, classes e utilitários para tratamento padronizado de erros.
 *
 * Exports principais:
 * - AuthError: classe de erro tipado (estende Error)
 * - AuthErrorCode: enum com códigos de erro
 * - authErrorMapper: converte erros de API/mock para AuthError
 * - authErrorFactory: cria AuthError de forma conveniente
 */

export { AuthError, AuthErrorCode } from "./auth-error.types";
export type { AuthErrorDetails, AuthResult } from "./auth-error.types";

export { AUTH_ERROR_MESSAGES, getAuthErrorMessage } from "./auth-error.messages";

export { createAuthError, authErrorFactory } from "./auth-error.factory";

export { authErrorMapper } from "./auth-error.mapper";
