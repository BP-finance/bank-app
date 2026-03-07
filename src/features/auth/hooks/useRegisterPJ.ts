/**
 * Hook de cadastro de Pessoa Jurídica.
 * Navega conforme onboardingStatus retornado pelo backend.
 * Reutiliza a mesma estratégia do fluxo PF.
 */

import { useCallback, useState } from "react";
import { Href, useRouter } from "expo-router";
import { registerPJService } from "../services/register-pj.service";
import type { RegisterPJRequest } from "../types/register-pj.types";
import { AUTH_MESSAGES } from "../constants";
import { ONBOARDING_STATUS_ROUTES } from "../constants/onboarding-routes.constants";

export function useRegisterPJ() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (data: RegisterPJRequest) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await registerPJService.execute(data);
        const route = ONBOARDING_STATUS_ROUTES[result.onboardingStatus];
        router.replace(route as Href);
      } catch (e) {
        const msg = e instanceof Error ? e.message : AUTH_MESSAGES.REGISTER_ERROR;
        setError(msg);
        throw e;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router]
  );

  return { register, isSubmitting, error };
}
