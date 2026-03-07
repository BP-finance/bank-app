/**
 * Utilitário central para decisão de rota com base em autenticação e onboarding.
 * Evita lógica espalhada por múltiplas telas.
 */

import { AUTH_ROUTES } from "../constants/auth-routes.constants";
import { ONBOARDING_STATUS_ROUTES } from "../constants/onboarding-routes.constants";
import type { OnboardingStatus } from "../types/onboarding-status.types";

export interface ResolveAuthRouteParams {
  isAuthenticated: boolean;
  onboardingStatus?: OnboardingStatus | null;
}

/**
 * Retorna a rota correta com base no estado de autenticação e onboarding.
 *
 * - Sem sessão → login
 * - Com sessão e onboarding aprovado → área principal
 * - Com sessão e onboarding incompleto → tela de status correspondente
 */
export function resolveAuthRoute(params: ResolveAuthRouteParams): string {
  const { isAuthenticated, onboardingStatus } = params;

  if (!isAuthenticated) {
    return AUTH_ROUTES.LOGIN;
  }

  if (!onboardingStatus || onboardingStatus === "aprovado") {
    return AUTH_ROUTES.MAIN;
  }

  return ONBOARDING_STATUS_ROUTES[onboardingStatus];
}
