/**
 * Hook central do fluxo de cadastro step-by-step.
 * Orquestra fases, steps e submissão, chamando services diretamente.
 * screen → hook → service
 */

import { useCallback, useState } from "react";
import { Href, useRouter } from "expo-router";
import {
  getRegisterStepsConfig,
  REGISTER_FLOW_INITIAL_VALUES,
  type RegisterFlowFieldKey,
  type RegisterFlowFormValues,
  type StepConfig,
} from "../config/registerSteps.config";
import { registerPFService } from "../services/register-pf.service";
import { registerPJService } from "../services/register-pj.service";
import { ONBOARDING_STATUS_ROUTES } from "../constants/onboarding-routes.constants";
import { AUTH_MESSAGES } from "../constants";
import type { PersonType } from "../types";
import {
  sanitizeDocumento,
  sanitizePhone,
  isValidCPF,
  isValidCNPJ,
  isValidPhone,
} from "../utils";

export type RegisterPhase = "splash" | "welcome" | "steps";

export function useRegisterFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<RegisterPhase>("splash");
  const [personType, setPersonType] = useState<PersonType | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formValues, setFormValues] = useState<RegisterFlowFormValues>(REGISTER_FLOW_INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterFlowFieldKey, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepConfig = personType ? getRegisterStepsConfig(personType).steps : null;
  const totalSteps = stepConfig?.length ?? 0;
  const currentStep = stepConfig?.[currentStepIndex] ?? null;

  const goToWelcome = useCallback(() => setPhase("welcome"), []);

  const selectPersonType = useCallback((type: PersonType) => {
    setPersonType(type);
    setCurrentStepIndex(0);
    setFormValues(REGISTER_FLOW_INITIAL_VALUES);
    setFieldErrors({});
    setPhase("steps");
  }, []);

  const setFieldValue = useCallback((key: RegisterFlowFieldKey, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (step: StepConfig): string | null => {
      const value = formValues[step.id];
      const str = typeof value === "string" ? value : "";

      switch (step.id) {
        case "nomeCompleto":
        case "razaoSocial":
        case "representanteNome":
          return str.trim().length > 0 ? null : "Campo obrigatório";
        case "nomeFantasia":
          return null; // opcional
        case "cpf":
        case "representanteCpf":
          return isValidCPF(str) ? null : AUTH_MESSAGES.CPF_INVALIDO;
        case "cnpj":
          return isValidCNPJ(str) ? null : AUTH_MESSAGES.CNPJ_INVALIDO;
        case "email":
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim()) ? null : "E-mail inválido";
        case "telefone":
          return isValidPhone(str) ? null : AUTH_MESSAGES.TELEFONE_INVALIDO;
        case "senha":
          return str.length >= 8 ? null : "Mínimo 8 caracteres";
        case "confirmarSenha":
          return str === formValues.senha ? null : "Senhas não conferem";
        case "acceptTerms":
          return value === true ? null : "Aceite os termos para continuar";
        default:
          return null;
      }
    },
    [formValues]
  );

  const goNextStep = useCallback(() => {
    if (!currentStep) return;
    const err = validateStep(currentStep);
    if (err) {
      setFieldErrors((prev) => ({ ...prev, [currentStep.id]: err }));
      return;
    }
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((i) => i + 1);
    }
  }, [currentStep, currentStepIndex, totalSteps, validateStep]);

  const goPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
      setFieldErrors({});
    }
  }, [currentStepIndex]);

  const canGoNext = true;
  const canGoPrev = currentStepIndex > 0;

  const submit = useCallback(async () => {
    if (!personType || !stepConfig) return;

    const lastStep = stepConfig[stepConfig.length - 1];
    const lastErr = validateStep(lastStep);
    if (lastErr) {
      setFieldErrors((prev) => ({ ...prev, [lastStep.id]: lastErr }));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (personType === "PF") {
        const result = await registerPFService.execute({
          nomeCompleto: formValues.nomeCompleto,
          cpf: sanitizeDocumento(formValues.cpf),
          email: formValues.email.trim(),
          telefone: sanitizePhone(formValues.telefone),
          senha: formValues.senha,
          acceptTerms: formValues.acceptTerms,
        });
        const route = ONBOARDING_STATUS_ROUTES[result.onboardingStatus];
        router.replace(route as Href);
      } else {
        const result = await registerPJService.execute({
          razaoSocial: formValues.razaoSocial,
          nomeFantasia: formValues.nomeFantasia || undefined,
          cnpj: sanitizeDocumento(formValues.cnpj),
          email: formValues.email.trim(),
          telefone: sanitizePhone(formValues.telefone),
          senha: formValues.senha,
          representanteLegal: {
            nome: formValues.representanteNome,
            cpf: sanitizeDocumento(formValues.representanteCpf),
          },
          acceptTerms: formValues.acceptTerms,
        });
        const route = ONBOARDING_STATUS_ROUTES[result.onboardingStatus];
        router.replace(route as Href);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : AUTH_MESSAGES.REGISTER_ERROR;
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [personType, stepConfig, formValues, validateStep, router]);

  return {
    phase,
    personType,
    currentStepIndex,
    totalSteps,
    formValues,
    fieldErrors,
    isSubmitting,
    submitError,
    currentStep,
    stepConfig,
    goToWelcome,
    selectPersonType,
    goNextStep,
    goPrevStep,
    canGoNext,
    canGoPrev,
    setFieldValue,
    submit,
  };
}
