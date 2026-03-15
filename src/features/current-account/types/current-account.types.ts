/**
 * Contrato mínimo da conta atual.
 * Distinto de AuthenticatedUser; o identificador operacional da conta é id.
 */

export interface CurrentAccount {
  /** Identificador operacional da conta (usado como accountId em SECURITY/Pix). */
  id: string;
  /** Origem do dado: temporária (sessão) ou futura (Get Current Account Idez). */
  source: "session-fallback" | "backend";
  /**
   * Metadado temporário: id do usuário dono da conta, quando derivado da sessão.
   * Existe apenas enquanto Get Current Account da Idez ainda não estiver plugado.
   * Não deve ser tratado como identificador operacional da conta; use currentAccount.id.
   */
  ownerUserId?: string;
  personType?: "PF" | "PJ";
}
