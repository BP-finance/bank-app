/**
 * Política de limpeza do material de segurança — decisões explícitas v1.
 *
 * DECISÃO LOGOUT:
 * - Logout simples NÃO remove o material do PIN.
 * - Motivo: decisão de produto/segurança v1 — o usuário pode fazer logout
 *   temporário e espera manter o PIN configurado ao retornar.
 *
 * DECISÃO TROCA DE CONTA:
 * - Ao trocar de conta, o material da conta ANTERIOR deve ser limpo.
 * - Chamar clearSecurityState({ accountId: previousAccountId }).
 * - O material da nova conta é independente (chaves separadas por accountId).
 *
 * DECISÃO RESET FUTURO:
 * - Reset de PIN (não implementado na v1) deve remover material anterior
 *   antes de permitir novo setup.
 * - Usar clearPinMaterial(accountId) internamente.
 */

export const SECURITY_CLEANUP_POLICY = {
  /** Logout não remove material do PIN */
  LOGOUT_CLEARS_PIN: false,
  /** Troca de conta exige limpeza da conta anterior */
  ACCOUNT_CHANGE_REQUIRES_CLEAR: true,
} as const;
