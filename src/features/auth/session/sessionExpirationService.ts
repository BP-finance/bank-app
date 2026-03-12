/**
 * Serviço de detecção proativa de expiração de sessão.
 * Avalia se tokens armazenados estão expirados com base em expiresAt.
 *
 * Regra: expiresAt ausente → sessão não expirada (preserva comportamento atual).
 */

import type { StoredTokens } from "./session.types";

/**
 * Verifica se a sessão está expirada com base em expiresAt.
 *
 * @param tokens Tokens armazenados (StoredTokens).
 * @returns true se expiresAt existe e Date.now() >= expiresAt; false caso contrário.
 *          Se expiresAt for undefined, retorna false (sessão válida).
 */
export function isSessionExpired(tokens: StoredTokens): boolean {
  const { expiresAt } = tokens;
  if (expiresAt === undefined || expiresAt === null) {
    return false;
  }
  return Date.now() >= expiresAt;
}
