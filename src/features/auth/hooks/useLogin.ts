/**
 * Hook de login.
 * Usa documento (CPF ou CNPJ) + senha.
 * Navega conforme onboardingStatus retornado pela API.
 */

import { useCallback, useState } from "react";
import { Href, useRouter } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";
import { loginService } from "../services/login.service";
import type { LoginRequest } from "../types/login.types";
import { AUTH_MESSAGES } from "../constants";
import { resolveAuthRoute } from "../utils/resolve-auth-route.util";

export function useLogin() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);
  const setError = useAuthStore((s) => s.setError);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useCallback(
    async (data: LoginRequest) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const session = await loginService.execute(data);
        loginStore(session);
        const route = resolveAuthRoute({
          isAuthenticated: true,
          onboardingStatus: session.user.onboardingStatus,
        });
        router.replace(route as Href);
      } catch (e) {
        const msg = e instanceof Error ? e.message : AUTH_MESSAGES.LOGIN_ERROR;
        setError(msg);
        throw e;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loginStore, setError, router]
  );

  return { login, isSubmitting };
}
