/**
 * Limpa estado da feature SECURITY.
 *
 * Comportamento (v1):
 * - accountId informado: remove material de PIN da conta (troca de conta, reset futuro).
 * - Logout: NÃO chama esta função para limpar PIN (decisão SECURITY_CLEANUP_POLICY.LOGOUT_CLEARS_PIN).
 * - Troca de conta: o chamador deve passar o accountId da conta que está saindo.
 *
 * Limpeza de store em memória será feita na TASK 4.
 */

import { clearPinMaterial } from "../infra/pinStorage";

export interface ClearSecurityStateOptions {
  /** ID da conta para limpar material de PIN (obrigatório em troca de conta) */
  accountId?: string;
}

export async function clearSecurityState(
  options?: ClearSecurityStateOptions
): Promise<void> {
  if (options?.accountId) {
    await clearPinMaterial(options.accountId);
  }
}
