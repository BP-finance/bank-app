/**
 * Camada de persistência de tokens.
 * Encapsula operações de storage seguro.
 * Usa objetos para salvar/recuperar tokens (não parâmetros soltos).
 */

import { secureStorageService } from "@/src/features/security/services";
import type { StoredTokens, TokensPayload } from "./session.types";

export const sessionStorage = {
  /**
   * Salva tokens no storage seguro.
   * @param tokens Objeto com accessToken, refreshToken e expiresAt opcional.
   */
  async saveTokens(tokens: TokensPayload): Promise<void> {
    await secureStorageService.setTokens(
      tokens.accessToken,
      tokens.refreshToken
    );
  },

  /**
   * Recupera tokens do storage seguro.
   * @returns Objeto com accessToken e refreshToken (podem ser null).
   */
  async getTokens(): Promise<StoredTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      secureStorageService.getAccessToken(),
      secureStorageService.getRefreshToken(),
    ]);
    return { accessToken, refreshToken };
  },

  /**
   * Remove todos os tokens do storage.
   */
  async clearTokens(): Promise<void> {
    await secureStorageService.clearTokens();
  },

  /**
   * Verifica se existem tokens armazenados.
   * @returns true se accessToken existe.
   */
  async hasStoredTokens(): Promise<boolean> {
    const { accessToken } = await this.getTokens();
    return !!accessToken;
  },
};
