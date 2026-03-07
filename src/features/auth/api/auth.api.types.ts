/**
 * Contratos da API de autenticação.
 * Refletem o formato retornado pelo backend (success/data, erros padronizados).
 * Mappers transformam em modelos internos.
 */

import type { OnboardingStatus } from "../types/onboarding-status.types";

/** Padrão de resposta de sucesso do backend */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Padrão de resposta de erro do backend */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** User retornado em login e me */
export interface ApiUser {
  id: string;
  nome: string;
  email: string;
  documento: string;
  tipoConta: "PF" | "PJ";
  onboardingStatus: OnboardingStatus;
}

/** Payload de login enviado ao backend */
export interface LoginApiRequest {
  documento: string;
  senha: string;
}

/** Data de sucesso do login */
export interface LoginApiData {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export type LoginApiResponse = ApiSuccessResponse<LoginApiData>;

/** Payload de forgot password enviado ao backend */
export interface ForgotPasswordApiRequest {
  documento: string;
}

/** Data de sucesso de forgot password */
export interface ForgotPasswordApiData {
  message: string;
}

export type ForgotPasswordApiResponse = ApiSuccessResponse<ForgotPasswordApiData>;

/** Payload de cadastro PF enviado ao backend */
export interface RegisterPFApiRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  acceptTerms: boolean;
}

/** Data de sucesso do cadastro PF */
export interface RegisterPFApiData {
  userId: string;
  tipoConta: "PF";
  onboardingStatus: OnboardingStatus;
  nextStep: string;
}

export type RegisterPFApiResponse = ApiSuccessResponse<RegisterPFApiData>;

/** Payload de cadastro PJ enviado ao backend */
export interface RegisterPJApiRequest {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email: string;
  telefone: string;
  senha: string;
  representanteLegal: {
    nome: string;
    cpf: string;
  };
  acceptTerms: boolean;
}

/** Data de sucesso do cadastro PJ */
export interface RegisterPJApiData {
  userId: string;
  tipoConta: "PJ";
  onboardingStatus: OnboardingStatus;
  nextStep: string;
}

export type RegisterPJApiResponse = ApiSuccessResponse<RegisterPJApiData>;

/** Data retornada por GET /auth/me */
export type MeApiResponse = ApiSuccessResponse<ApiUser>;
