/**
 * @deprecated Use sessionManager de ../session em vez deste arquivo.
 * Este arquivo será removido em versão futura.
 *
 * Serviço de gerenciamento de sessão (LEGADO).
 * Responsável por:
 * - Salvar tokens no storage seguro
 * - Limpar tokens no logout
 * - Carregar tokens armazenados
 * - Hidratar sessão via datasource.me (usuário real ou mock)
 */

import { authDataSourceFactory } from "../data/datasources/authDataSourceFactory";
import { mapApiUserToAuthenticatedUser } from "../mappers/session.mapper";
import { secureStorageService } from "@/src/features/security/services";
import type { AuthSession } from "../types/auth-session.types";

export const sessionService = {
  async persistSession(session: AuthSession): Promise<void> {
    await secureStorageService.setTokens(
      session.accessToken,
      session.refreshToken ?? ""
    );
  },

  async clearSession(): Promise<void> {
    const dataSource = authDataSourceFactory();
    await dataSource.logout();
    await secureStorageService.clearTokens();
  },

  async loadStoredTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      secureStorageService.getAccessToken(),
      secureStorageService.getRefreshToken(),
    ]);
    return { accessToken, refreshToken };
  },

  /**
   * Hidrata sessão com usuário real via GET /auth/me (ou mock).
   * Usado após login ou ao reabrir app com token salvo.
   */
  async hydrateSession(
    accessToken: string,
    refreshToken: string | null
  ): Promise<AuthSession | null> {
    try {
      const dataSource = authDataSourceFactory();
      const apiUser = await dataSource.me(accessToken);
      const user = mapApiUserToAuthenticatedUser(apiUser);
      return {
        accessToken,
        refreshToken: refreshToken ?? undefined,
        user,
      };
    } catch {
      return null;
    }
  },
};
