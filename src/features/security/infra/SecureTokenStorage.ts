/**
 * ------------------------------------------------------------------
 * Secure Token Storage
 * ------------------------------------------------------------------
 *
 * Abstração para armazenamento seguro de tokens (access/refresh).
 * Usa expo-secure-store quando disponível; fallback para AsyncStorage.
 *
 * Chaves isoladas por módulo de autenticação.
 * ------------------------------------------------------------------
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: "auth.accessToken",
  REFRESH_TOKEN: "auth.refreshToken",
  EXPIRES_AT: "auth.expiresAt",
} as const;

export interface TokenStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Interface pública do storage de tokens */
export interface SecureTokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  getExpiresAt(): Promise<number | null>;
  setTokens(access: string, refresh: string, expiresAt?: number): Promise<void>;
  clearTokens(): Promise<void>;
}

/** Implementação usando adapter (permite injetar SecureStore ou mock) */
export function createSecureTokenStorage(
  adapter: TokenStorageAdapter
): SecureTokenStorage {
  return {
    async getAccessToken() {
      return adapter.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    },
    async getRefreshToken() {
      return adapter.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    },
    async getExpiresAt() {
      const raw = await adapter.getItem(TOKEN_KEYS.EXPIRES_AT);
      if (raw === null) return null;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    },
    async setTokens(access: string, refresh: string, expiresAt?: number) {
      const ops: Promise<void>[] = [
        adapter.setItem(TOKEN_KEYS.ACCESS_TOKEN, access),
        adapter.setItem(TOKEN_KEYS.REFRESH_TOKEN, refresh),
      ];
      if (expiresAt !== undefined) {
        ops.push(adapter.setItem(TOKEN_KEYS.EXPIRES_AT, String(expiresAt)));
      } else {
        ops.push(adapter.removeItem(TOKEN_KEYS.EXPIRES_AT));
      }
      await Promise.all(ops);
    },
    async clearTokens() {
      await Promise.all([
        adapter.removeItem(TOKEN_KEYS.ACCESS_TOKEN),
        adapter.removeItem(TOKEN_KEYS.REFRESH_TOKEN),
        adapter.removeItem(TOKEN_KEYS.EXPIRES_AT),
      ]);
    },
  };
}
