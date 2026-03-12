/**
 * Data source mock para testes manuais sem backend.
 * Usa AuthError para erros tipados.
 */

import type {
  LoginApiRequest,
  LoginApiData,
  RegisterPFApiRequest,
  RegisterPFApiData,
  RegisterPJApiRequest,
  RegisterPJApiData,
  ForgotPasswordApiRequest,
  ForgotPasswordApiData,
  ApiUser,
} from "../../api/auth.api.types";
import type { AuthDataSource } from "./AuthDataSource";
import {
  getMockScenarioByDocumento,
  scenarioToApiUser,
} from "../mocks/mockAuthScenarios";
import { authErrorFactory } from "../../errors";

const MOCK_DELAY_MS = 300;
const MOCK_LOGIN_ERROR_DOC = "00000000000";
const MOCK_TOKEN_PREFIX = "mock-access-";
const MOCK_REFRESH_PREFIX = "mock-refresh-";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractDocumentoFromToken(accessToken: string): string | null {
  if (!accessToken.startsWith(MOCK_TOKEN_PREFIX)) return null;
  return accessToken.slice(MOCK_TOKEN_PREFIX.length) || null;
}

function resolveDocumentoForPJ(data: RegisterPJApiRequest): string {
  return data.representanteLegal?.cpf?.replace(/\D/g, "") ?? data.cnpj.replace(/\D/g, "");
}

export const mockAuthDataSource: AuthDataSource = {
  async login(data: LoginApiRequest): Promise<LoginApiData> {
    await delay(MOCK_DELAY_MS);
    const doc = data.documento.replace(/\D/g, "");
    if (doc === MOCK_LOGIN_ERROR_DOC) {
      throw authErrorFactory.invalidCredentials();
    }
    const scenario = getMockScenarioByDocumento(data.documento);
    if (!scenario) {
      throw authErrorFactory.invalidCredentials();
    }
    if (scenario.senha !== data.senha) {
      throw authErrorFactory.invalidCredentials();
    }
    const user = scenarioToApiUser(scenario);
    return {
      accessToken: `${MOCK_TOKEN_PREFIX}${scenario.documento}`,
      refreshToken: `${MOCK_REFRESH_PREFIX}${scenario.documento}`,
      user,
    };
  },

  async registerPF(data: RegisterPFApiRequest): Promise<RegisterPFApiData> {
    await delay(MOCK_DELAY_MS);
    const doc = data.cpf.replace(/\D/g, "");
    const scenario = getMockScenarioByDocumento(data.cpf) ?? {
      documento: doc,
      nome: data.nomeCompleto,
      email: data.email,
      tipoConta: "PF" as const,
      onboardingStatus: "pendente" as const,
      senha: "",
    };
    return {
      userId: `mock-pf-${doc}`,
      tipoConta: "PF",
      onboardingStatus: scenario.onboardingStatus ?? "pendente",
      nextStep: "validar_otp",
    };
  },

  async registerPJ(data: RegisterPJApiRequest): Promise<RegisterPJApiData> {
    await delay(MOCK_DELAY_MS);
    const doc = resolveDocumentoForPJ(data);
    const scenario = getMockScenarioByDocumento(doc) ?? {
      documento: doc,
      nome: data.representanteLegal.nome,
      email: data.email,
      tipoConta: "PJ" as const,
      onboardingStatus: "pendente" as const,
      senha: "",
    };
    return {
      userId: `mock-pj-${doc}`,
      tipoConta: "PJ",
      onboardingStatus: scenario.onboardingStatus ?? "pendente",
      nextStep: "validar_otp",
    };
  },

  async forgotPassword(data: ForgotPasswordApiRequest): Promise<ForgotPasswordApiData> {
    await delay(MOCK_DELAY_MS);
    const doc = data.documento.replace(/\D/g, "");
    if (doc === MOCK_LOGIN_ERROR_DOC) {
      throw authErrorFactory.userNotFound();
    }
    return { message: "Solicitação recebida com sucesso." };
  },

  async me(accessToken: string): Promise<ApiUser> {
    await delay(MOCK_DELAY_MS);
    const doc = extractDocumentoFromToken(accessToken);
    if (!doc) {
      throw authErrorFactory.sessionExpired();
    }
    const scenario = getMockScenarioByDocumento(doc);
    if (!scenario) {
      throw authErrorFactory.sessionExpired();
    }
    return scenarioToApiUser(scenario, `mock-user-${doc}`);
  },

  async logout(): Promise<void> {
    await delay(100);
  },
};
