/**
 * Responsável por hidratar sessão com dados do usuário.
 * Transforma tokens em AuthSession completa via /auth/me.
 * Compatível com mocks via authDataSourceFactory.
 */

import { authDataSourceFactory } from "../data/datasources/authDataSourceFactory";
import { mapApiUserToAuthenticatedUser } from "../mappers/session.mapper";
import type { AuthSession } from "../types/auth-session.types";
import type {
  StoredTokens,
  SessionHydrateResult,
  SessionErrorCode,
} from "./session.types";

/**
 * Cria erro de hidratação padronizado.
 */
function createHydrationError(
  code: SessionErrorCode,
  message: string,
  originalError?: unknown
): SessionHydrateResult {
  return {
    success: false,
    session: null,
    error: { code, message, originalError },
  };
}

export const sessionHydrator = {
  /**
   * Hidrata sessão buscando dados do usuário via /auth/me.
   * Usa authDataSourceFactory para compatibilidade com mocks.
   *
   * @param tokens Tokens armazenados (accessToken obrigatório).
   * @returns Resultado tipado com session ou erro.
   */
  async hydrate(tokens: StoredTokens): Promise<SessionHydrateResult> {
    if (!tokens.accessToken) {
      return createHydrationError(
        "NO_STORED_TOKENS" as SessionErrorCode,
        "Access token não encontrado."
      );
    }

    try {
      const dataSource = authDataSourceFactory();
      const apiUser = await dataSource.me(tokens.accessToken);
      const user = mapApiUserToAuthenticatedUser(apiUser);

      const session: AuthSession = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? undefined,
        user,
      };

      return {
        success: true,
        session,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao hidratar sessão.";

      return createHydrationError(
        "HYDRATION_FAILED" as SessionErrorCode,
        message,
        error
      );
    }
  },
};
