/**
 * Mensagens de erro para UI.
 * Mapeadas por AuthErrorCode para desacoplar da API.
 * Preparado para i18n futuro.
 */

import { AuthErrorCode } from "./auth-error.types";

/**
 * Mensagens padrão para cada código de erro.
 * UI deve usar estas mensagens, nunca mensagens diretas da API.
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]:
    "CPF/CNPJ ou senha incorretos. Verifique seus dados e tente novamente.",
  [AuthErrorCode.ACCOUNT_BLOCKED]:
    "Sua conta está bloqueada. Entre em contato com o suporte.",
  [AuthErrorCode.ACCOUNT_PENDING]:
    "Sua conta está pendente de aprovação.",
  [AuthErrorCode.DOCUMENTS_REQUIRED]:
    "Documentos pendentes de envio. Complete seu cadastro.",
  [AuthErrorCode.SESSION_EXPIRED]:
    "Sua sessão expirou. Faça login novamente.",
  [AuthErrorCode.NETWORK_ERROR]:
    "Erro de conexão. Verifique sua internet e tente novamente.",
  [AuthErrorCode.USER_NOT_FOUND]:
    "Usuário não encontrado. Verifique o documento informado.",
  [AuthErrorCode.UNKNOWN_ERROR]:
    "Ocorreu um erro inesperado. Tente novamente mais tarde.",
};

/**
 * Retorna mensagem para UI dado um código de erro.
 */
export function getAuthErrorMessage(code: AuthErrorCode): string {
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR];
}
