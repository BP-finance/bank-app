/**
 * Hook de cadastro de Pessoa Física.
 * Navega conforme onboardingStatus retornado pelo backend.
 */

import { useCallback, useState } from "react";
import { Href, useRouter } from "expo-router";
import { registerPFService } from "../services/register-pf.service";
import type { RegisterPFRequest } from "../types/register-pf.types";
import { AUTH_MESSAGES } from "../constants";
import { ONBOARDING_STATUS_ROUTES } from "../constants/onboarding-routes.constants";

export function useRegisterPF() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (data: RegisterPFRequest) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await registerPFService.execute(data);
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
