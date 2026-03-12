/**
 * Provider de token de autenticação para o httpClient.
 * Implementa a interface TokenProvider de shared/api.
 *
 * Este provider conecta o módulo AUTH à infraestrutura HTTP,
 * permitindo que o httpClient obtenha tokens sem importar
 * diretamente do módulo AUTH (inversão de dependência).
 *
 * Uso:
 * Durante o bootstrap da aplicação, configure o httpClient:
 * httpClient.setTokenProvider(authTokenProvider);
 */

import type { TokenProvider } from "../../../shared/api";
import { sessionStorage, isSessionExpired } from "../session";

/**
 * Provider de token para o httpClient.
 * Lê tokens do sessionStorage do módulo AUTH.
 * Retorna null se sessão estiver expirada (expiresAt presente e já passado).
 */
export const authTokenProvider: TokenProvider = {
  /**
   * Retorna o access token atual da sessão.
   * @returns Token ou null se não houver sessão ou se estiver expirada.
   */
  async getAccessToken(): Promise<string | null> {
    const tokens = await sessionStorage.getTokens();
    if (isSessionExpired(tokens)) {
      return null;
    }
    return tokens.accessToken;
  },

  /**
   * Retorna o refresh token atual da sessão.
   * @returns Token ou null se não houver sessão.
   */
  async getRefreshToken(): Promise<string | null> {
    const { refreshToken } = await sessionStorage.getTokens();
    return refreshToken;
  },
};
