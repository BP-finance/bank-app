/**
 * Hook de recuperação de senha.
 * Controla estado da tela e chama forgotPasswordService.
 *
 * Responsabilidades:
 * - Validação de documento (CPF ou CNPJ)
 * - Sanitização de dados antes de enviar ao service
 * - Gerenciamento de erros (validação + remotos)
 *
 * Screen deve apenas: chamar submit() e renderizar erros.
 */

import { useCallback, useState } from "react";
import { forgotPasswordService } from "../services/forgot-password.service";
import { AuthError, authErrorMapper } from "../errors";
import { isValidDocumentoLogin, sanitizeDocumento } from "../utils";
import { AUTH_MESSAGES } from "../constants";

/**
 * Dados do formulário de recuperação de senha.
 */
export interface ForgotPasswordFormData {
  documento: string;
}

/**
 * Erros de validação por campo.
 */
export interface ForgotPasswordValidationErrors {
  documento?: string;
}

/**
 * Valida os campos do formulário de recuperação.
 * Retorna objeto com erros por campo, ou null se válido.
 */
function validateForgotPasswordForm(
  data: ForgotPasswordFormData
): ForgotPasswordValidationErrors | null {
  const errors: ForgotPasswordValidationErrors = {};

  if (!data.documento || data.documento.trim().length === 0) {
    errors.documento = "Documento é obrigatório";
  } else if (!isValidDocumentoLogin(data.documento)) {
    errors.documento = AUTH_MESSAGES.DOCUMENTO_INVALIDO;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function useForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<ForgotPasswordValidationErrors | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Limpa todos os erros (validação + remotos).
   */
  const clearErrors = useCallback(() => {
    setValidationErrors(null);
    setError(null);
  }, []);

  /**
   * Executa recuperação de senha.
   * 1. Valida documento
   * 2. Sanitiza dados
   * 3. Chama service
   */
  const submit = useCallback(
    async (data: ForgotPasswordFormData) => {
      clearErrors();
      setSuccess(false);

      const errors = validateForgotPasswordForm(data);
      if (errors) {
        setValidationErrors(errors);
        return;
      }

      setIsSubmitting(true);

      try {
        await forgotPasswordService.execute({
          documento: sanitizeDocumento(data.documento),
        });
        setSuccess(true);
      } catch (e) {
        const authError = authErrorMapper.fromError(e);
        setError(authError);
        throw authError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearErrors]
  );

  return {
    submit,
    isSubmitting,
    error,
    validationErrors,
    success,
    clearErrors,
  };
}
