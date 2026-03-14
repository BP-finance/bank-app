/**
 * Tipos de credencial transacional.
 * Define o conceito de credencial e status de configuração.
 */

/**
 * Estado estrutural/configuracional da credencial transacional.
 *
 * Use quando precisar representar o estado técnico da credencial:
 * - configured: material seguro persistido e válido (hash, salt, metadados)
 * - not_configured: sem material válido
 * - blocked: bloqueio temporário ativo
 * - unavailable: indisponível temporariamente (ex: erro técnico)
 *
 * Este tipo é mais granular e voltado à configuração interna.
 */
export type CredentialConfigurationStatus =
  | "configured"
  | "not_configured"
  | "blocked"
  | "unavailable";

/**
 * Visão simplificada orientada ao fluxo: usuário tem PIN ou não?
 *
 * Use quando precisar responder:
 * - o usuário já possui PIN configurado?
 * - ele está apto a seguir para challenge?
 * - ele precisa configurar PIN antes?
 *
 * Diferente de CredentialConfigurationStatus: este foca na pergunta
 * "tem ou não tem PIN" para decisões de fluxo; CredentialConfigurationStatus
 * representa o estado estrutural completo (inclui blocked, unavailable).
 *
 * Mapeamento conceitual: has_pin ≈ configured; no_pin ≈ not_configured.
 */
export type UserWithPinStatus = "has_pin" | "no_pin";
