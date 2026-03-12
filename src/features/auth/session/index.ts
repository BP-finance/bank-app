/**
 * Camada session do módulo AUTH.
 * Responsável por gerenciamento completo de sessão do usuário.
 *
 * Exports públicos:
 * - sessionManager: orquestrador principal (usar este na maioria dos casos)
 * - tipos para consumers que precisam tipar resultados
 */

export { sessionManager } from "./sessionManager";
export { sessionStorage } from "./sessionStorage";
export { sessionHydrator } from "./sessionHydrator";
export { isSessionExpired } from "./sessionExpirationService";

// Tipos puros (interfaces) - export type
export type {
  StoredTokens,
  TokensPayload,
  SessionError,
  SessionRestoreResult,
  SessionClearResult,
  SessionHydrateResult,
} from "./session.types";

// Enum - export como value (não type)
export { SessionErrorCode } from "./session.types";
