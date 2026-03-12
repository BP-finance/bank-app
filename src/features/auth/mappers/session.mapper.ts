/**
 * Mapper de sessão e usuário.
 * Transforma respostas da API em modelos internos.
 */

import type { ApiUser } from "../api/auth.api.types";
import type { LoginApiData } from "../api/auth.api.types";
import type { AuthSession, AuthenticatedUser } from "../types/auth-session.types";

export function mapApiUserToAuthenticatedUser(api: ApiUser): AuthenticatedUser {
  return {
    id: api.id,
    nome: api.nome,
    email: api.email,
    documento: api.documento,
    tipoConta: api.tipoConta,
    onboardingStatus: api.onboardingStatus,
  };
}

export function mapLoginDataToSession(data: LoginApiData): AuthSession {
  const expiresAt =
    data.expiresIn != null
      ? Date.now() + data.expiresIn * 1000
      : undefined;
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: mapApiUserToAuthenticatedUser(data.user),
    expiresAt,
  };
}
