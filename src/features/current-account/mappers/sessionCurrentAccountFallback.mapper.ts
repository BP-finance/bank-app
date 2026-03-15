/**
 * Fallback temporário: deriva CurrentAccount a partir da sessão autenticada.
 *
 * Este é o ÚNICO lugar do app onde session.user.id é usado para montar a conta atual.
 * Origem futura do dado: endpoint Get Current Account da Idez.
 * Não espalhar esta equivalência pelo código; consumidores devem usar currentAccount.id
 * via useCurrentAccount() ou resolveCurrentAccount().
 */

import type { AuthSession } from "@/src/features/auth";
import type { CurrentAccount } from "../types/current-account.types";

/**
 * Converte sessão em conta atual quando ainda não há integração com Get Current Account.
 * Retorna null se não houver sessão ou user.
 */
export function mapSessionToCurrentAccountFallback(
  session: AuthSession | null
): CurrentAccount | null {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id: user.id,
    source: "session-fallback",
    ownerUserId: user.id,
    personType: user.tipoConta,
  };
}
