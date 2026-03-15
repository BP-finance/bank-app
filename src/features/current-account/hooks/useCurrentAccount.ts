/**
 * Hook que expõe a conta atual e flag de existência.
 */

import { useMemo } from "react";
import { useAuthStore } from "@/src/features/auth";
import { mapSessionToCurrentAccountFallback } from "../mappers/sessionCurrentAccountFallback.mapper";
import type { CurrentAccount } from "../types/current-account.types";

export interface UseCurrentAccountResult {
  currentAccount: CurrentAccount | null;
  hasCurrentAccount: boolean;
}

/**
 * Retorna a conta atual (resolução centralizada) e um booleano para consumo direto.
 * Não deriva accountId de session.user.id; usa apenas o owner current-account.
 */
export function useCurrentAccount(): UseCurrentAccountResult {
  const session = useAuthStore((s) => s.session);
  return useMemo(() => {
    const currentAccount = mapSessionToCurrentAccountFallback(session);
    return {
      currentAccount,
      hasCurrentAccount: currentAccount !== null,
    };
  }, [session]);
}
