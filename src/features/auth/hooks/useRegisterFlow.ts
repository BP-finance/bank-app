/**
 * Hook central do fluxo de cadastro step-by-step.
 * Orquestra fases, steps e submissão, chamando services diretamente.
 * Suporta múltiplos campos por etapa.
 * 
 * Validação em 3 níveis:
 * 1. validateField() — validação de campo individual
 * 2. validateStep() — validação de todos os campos de uma etapa
 * 3. validateAllSteps() — validação final de todo o fluxo antes do submit
 * 
 * screen → hook → service
 */

import { useCallback, useState } from "react";
import { Href, useRouter } from "expo-router";
import {
  getRegisterStepsConfig,
  REGISTER_FLOW_INITIAL_VALUES,
  type FieldConfig,
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

interface ValidationResult {
  errors: Partial<Record<RegisterFlowFieldKey, string>>;
  firstInvalidStepIndex: number | null;
}

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

  /**
   * Nível 1: Validação de campo individual
   * Cada campo tem sua regra específica de validação.
   * Reutiliza validadores existentes: isValidCPF, isValidCNPJ, isValidPhone
   */
  const validateField = useCallback(
    (field: FieldConfig, values: RegisterFlowFormValues = formValues): string | null => {
      const value = values[field.id];
      const str = typeof value === "string" ? value : "";

      if (field.optional && str.trim().length === 0) {
        return null;
      }

      switch (field.id) {
        case "nomeCompleto":
        case "razaoSocial":
        case "representanteNome":
          return str.trim().length > 0 ? null : "Campo obrigatório";
        case "nomeFantasia":
          return null;
        case "cpf":
        case "representanteCpf":
          if (str.trim().length === 0) return "Campo obrigatório";
          return isValidCPF(str) ? null : AUTH_MESSAGES.CPF_INVALIDO;
        case "cnpj":
          if (str.trim().length === 0) return "Campo obrigatório";
          return isValidCNPJ(str) ? null : AUTH_MESSAGES.CNPJ_INVALIDO;
        case "email":
          if (str.trim().length === 0) return "Campo obrigatório";
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim()) ? null : "E-mail inválido";
        case "telefone":
          if (str.trim().length === 0) return "Campo obrigatório";
          return isValidPhone(str) ? null : AUTH_MESSAGES.TELEFONE_INVALIDO;
        case "senha":
          if (str.length === 0) return "Campo obrigatório";
          return str.length >= 8 ? null : "Mínimo 8 caracteres";
        case "confirmarSenha":
          if (str.length === 0) return "Campo obrigatório";
          return str === values.senha ? null : "Senhas não conferem";
        case "acceptTerms":
          return value === true ? null : "Aceite os termos para continuar";
        default:
          return null;
      }
    },
    [formValues]
  );

  /**
   * Nível 2: Validação de etapa
   * Valida todos os campos de uma etapa específica.
   * Inclui validações compostas (ex: senha === confirmarSenha)
   */
  const validateStep = useCallback(
    (step: StepConfig, values: RegisterFlowFormValues = formValues): Partial<Record<RegisterFlowFieldKey, string>> => {
      const errors: Partial<Record<RegisterFlowFieldKey, string>> = {};
      
      for (const field of step.fields) {
        const err = validateField(field, values);
        if (err) {
          errors[field.id] = err;
        }
      }

      return errors;
    },
    [validateField]
  );

  /**
   * Nível 3: Validação final de todo o fluxo
   * Revalida TODAS as etapas antes do submit.
   * Retorna erros e o índice da primeira etapa inválida.
   */
  const validateAllSteps = useCallback(
    (steps: StepConfig[], values: RegisterFlowFormValues = formValues): ValidationResult => {
      const allErrors: Partial<Record<RegisterFlowFieldKey, string>> = {};
      let firstInvalidStepIndex: number | null = null;

      for (let i = 0; i < steps.length; i++) {
        const stepErrors = validateStep(steps[i], values);
        if (Object.keys(stepErrors).length > 0) {
          Object.assign(allErrors, stepErrors);
          if (firstInvalidStepIndex === null) {
            firstInvalidStepIndex = i;
          }
        }
      }

      return { errors: allErrors, firstInvalidStepIndex };
    },
    [validateStep]
  );

  const goNextStep = useCallback(() => {
    if (!currentStep) return;
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
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

    const { errors, firstInvalidStepIndex } = validateAllSteps(stepConfig, formValues);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      
      if (firstInvalidStepIndex !== null && firstInvalidStepIndex !== currentStepIndex) {
        setCurrentStepIndex(firstInvalidStepIndex);
        setSubmitError("Corrija os campos inválidos para continuar");
      }
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
  }, [personType, stepConfig, formValues, validateAllSteps, currentStepIndex, router]);

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
