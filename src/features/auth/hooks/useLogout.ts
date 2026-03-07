/**
 * Hook de logout.
 * Limpa sessão e redireciona para login.
 */

import { useCallback } from "react";
import { Href, useRouter } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";
import { AUTH_ROUTES } from "../constants/auth-routes.constants";

export function useLogout() {
  const router = useRouter();
  const logoutStore = useAuthStore((s) => s.logout);

  const logout = useCallback(async () => {
    await logoutStore();
    router.replace(AUTH_ROUTES.LOGIN as Href);
  }, [logoutStore, router]);

  return { logout };
}
