/**
 * Adapter de storage seguro para o material do PIN.
 * Usa expo-secure-store com chaves isoladas do auth (prefixo security.pin).
 */

export interface SecureKeyValueAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const PREFIX = "security.pin";

let secureStore: {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
} | null = null;

async function getSecureStore() {
  if (!secureStore) {
    const SecureStore = await import("expo-secure-store");
    secureStore = SecureStore;
  }
  return secureStore;
}

function scopedKey(accountId: string): string {
  return `${PREFIX}.material.${accountId}`;
}

export const pinSecureStoreAdapter: SecureKeyValueAdapter = {
  async getItem(accountId: string) {
    const store = await getSecureStore();
    return store.getItemAsync(scopedKey(accountId));
  },

  async setItem(accountId: string, value: string) {
    const store = await getSecureStore();
    await store.setItemAsync(scopedKey(accountId), value);
  },

  async removeItem(accountId: string) {
    const store = await getSecureStore();
    await store.deleteItemAsync(scopedKey(accountId));
  },
};
