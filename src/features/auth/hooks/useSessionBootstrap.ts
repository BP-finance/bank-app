/**
 * Hook de bootstrap de sessão ao abrir o app.
 * Carrega tokens, hidrata via /auth/me e determina a rota de destino.
 */

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { resolveAuthRoute } from "../utils/resolve-auth-route.util";

export interface SessionBootstrapResult {
  isBootstrapping: boolean;
  resolvedRoute: string | null;
}

/**
 * Executa bootstrap: verifica tokens, hidrata sessão via /me, resolve rota.
 */
export function useSessionBootstrap(): SessionBootstrapResult {
  const loadStoredSession = useAuthStore((s) => s.loadStoredSession);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [resolvedRoute, setResolvedRoute] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      await loadStoredSession();
      const { session, isAuthenticated } = useAuthStore.getState();
      const route = resolveAuthRoute({
        isAuthenticated,
        onboardingStatus: session?.user?.onboardingStatus ?? null,
      });
      setResolvedRoute(route);
      setIsBootstrapping(false);
    };
    run();
  }, [loadStoredSession]);

  return { isBootstrapping, resolvedRoute };
}
