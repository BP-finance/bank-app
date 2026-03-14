/**
 * Testes de não vazamento de dados sensíveis (TASK 10).
 * Garante que store, API e resultados não expõem segredos.
 */

import { useSecurityStore } from "../store";
import * as securityExports from "../index";

describe("security.no-leak", () => {
  it("store não guarda PIN, confirmação, hash ou salt", () => {
    const state = useSecurityStore.getState();
    const keys = Object.keys(state);
    const forbidden = ["pin", "confirmation", "hash", "salt"];
    for (const k of forbidden) {
      expect(keys).not.toContain(k);
      expect(state).not.toHaveProperty(k);
    }
  });

  it("API pública do SECURITY não exporta funções que recebem PIN como parâmetro direto", () => {
    const exports = Object.keys(securityExports);
    expect(exports).not.toContain("validatePin");
    expect(exports).not.toContain("persistPinForAccount");
  });

  it("API pública não exporta infra de storage ou crypto", () => {
    const exports = Object.keys(securityExports);
    expect(exports).not.toContain("pinSecureStoreAdapter");
    expect(exports).not.toContain("pinCrypto");
    expect(exports).not.toContain("readPinMaterial");
  });
});
