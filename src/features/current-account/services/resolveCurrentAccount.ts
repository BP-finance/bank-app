/**
 * Resolve a conta atual (fallback via sessão até Get Current Account estar plugado).
 */

import { useAuthStore } from "@/src/features/auth";
import { mapSessionToCurrentAccountFallback } from "../mappers/sessionCurrentAccountFallback.mapper";
import type { CurrentAccount } from "../types/current-account.types";

/**
 * Retorna a conta atual a partir do estado da sessão.
 * Uso fora de React (ex.: em callbacks ou serviços).
 */
export function resolveCurrentAccount(): CurrentAccount | null {
  const session = useAuthStore.getState().session;
  return mapSessionToCurrentAccountFallback(session);
}
