/**
 * Serviço de armazenamento seguro.
 * Encapsula SecureTokenStorage para uso pelo módulo de auth.
 * Armazena access token, refresh token e expiresAt (opcional).
 *
 * NUNCA armazena: PIN, OTP, facematch token.
 */

import { tokenStorage } from "../infra/tokenStorageInstance";

export const secureStorageService = {
  async getAccessToken(): Promise<string | null> {
    return tokenStorage.getAccessToken();
  },

  async getRefreshToken(): Promise<string | null> {
    return tokenStorage.getRefreshToken();
  },

  async getExpiresAt(): Promise<number | null> {
    return tokenStorage.getExpiresAt();
  },

  async setTokens(
    accessToken: string,
    refreshToken: string,
    expiresAt?: number
  ): Promise<void> {
    await tokenStorage.setTokens(accessToken, refreshToken, expiresAt);
  },

  async clearTokens(): Promise<void> {
    await tokenStorage.clearTokens();
  },
};
