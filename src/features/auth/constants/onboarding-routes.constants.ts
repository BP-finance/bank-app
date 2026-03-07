/**
 * Rotas de onboarding por status.
 * Usadas para navegação após cadastro PF.
 */

import type { OnboardingStatus } from "../types/onboarding-status.types";

export const ONBOARDING_STATUS_ROUTES: Record<OnboardingStatus, string> = {
  pendente: "/auth/onboarding/pendente",
  em_analise: "/auth/onboarding/em-analise",
  aprovado: "/auth/onboarding/aprovado",
  rejeitado: "/auth/onboarding/rejeitado",
  documentos_pendentes: "/auth/onboarding/documentos-pendentes",
} as const;
