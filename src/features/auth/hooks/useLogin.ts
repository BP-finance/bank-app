/**
 * Hook de login.
 * Usa documento (CPF ou CNPJ) + senha.
 * Navega conforme onboardingStatus retornado pela API.
 *
 * Responsabilidades:
 * - Validação de campos (documento, senha)
 * - Sanitização de dados antes de enviar ao service
 * - Gerenciamento de erros (validação + remotos)
 *
 * Screen deve apenas: chamar login() e renderizar erros.
 */

import { useCallback, useState } from "react";
import { Href, useRouter } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";
import { loginService } from "../services/login.service";
import { resolveAuthRoute } from "../utils/resolve-auth-route.util";
import { authErrorMapper } from "../errors";
import { isValidDocumentoLogin, sanitizeDocumento } from "../utils";
import { AUTH_MESSAGES } from "../constants";

/**
 * Dados do formulário de login (como vêm da screen, com máscara).
 */
export interface LoginFormData {
  documento: string;
  senha: string;
}

/**
 * Erros de validação por campo.
 */
export interface LoginValidationErrors {
  documento?: string;
  senha?: string;
}

/**
 * Valida os campos do formulário de login.
 * Retorna objeto com erros por campo, ou null se válido.
 */
function validateLoginForm(data: LoginFormData): LoginValidationErrors | null {
  const errors: LoginValidationErrors = {};

  if (!data.documento || data.documento.trim().length === 0) {
    errors.documento = "Documento é obrigatório";
  } else if (!isValidDocumentoLogin(data.documento)) {
    errors.documento = AUTH_MESSAGES.DOCUMENTO_INVALIDO;
  }

  if (!data.senha || data.senha.length === 0) {
    errors.senha = "Senha é obrigatória";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function useLogin() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);
  const setAuthError = useAuthStore((s) => s.setAuthError);
  const authError = useAuthStore((s) => s.authError);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] =
    useState<LoginValidationErrors | null>(null);

  /**
   * Limpa todos os erros (validação + remotos).
   */
  const clearErrors = useCallback(() => {
    setValidationErrors(null);
    setAuthError(null);
  }, [setAuthError]);

  /**
   * Executa login.
   * 1. Valida campos
   * 2. Sanitiza dados
   * 3. Chama service
   * 4. Navega conforme onboardingStatus
   */
  const login = useCallback(
    async (data: LoginFormData) => {
      clearErrors();

      const errors = validateLoginForm(data);
      if (errors) {
        setValidationErrors(errors);
        return;
      }

      setIsSubmitting(true);

      try {
        const session = await loginService.execute({
          documento: sanitizeDocumento(data.documento),
          senha: data.senha,
        });
        loginStore(session);
        const route = resolveAuthRoute({
          isAuthenticated: true,
          onboardingStatus: session.user.onboardingStatus,
        });
        router.replace(route as Href);
      } catch (e) {
        const error = authErrorMapper.fromError(e);
        setAuthError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loginStore, setAuthError, router, clearErrors]
  );

  return {
    login,
    isSubmitting,
    error: authError,
    validationErrors,
    clearErrors,
  };
}
