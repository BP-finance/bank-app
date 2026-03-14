/**
 * Testes do challenge transacional reutilizável (TASK 7).
 */

const mockStore = new Map<string, string>();
const CORRECT_HASH = "stored-hash-123";
const WRONG_HASH = "wrong-hash";

jest.mock("../../infra/pinStorage/pinSecureStoreAdapter", () => ({
  pinSecureStoreAdapter: {
    getItem: (accountId: string) =>
      Promise.resolve(mockStore.get(`security.pin.material.${accountId}`) ?? null),
    setItem: (accountId: string, value: string) => {
      mockStore.set(`security.pin.material.${accountId}`, value);
      return Promise.resolve();
    },
    removeItem: (accountId: string) => {
      mockStore.delete(`security.pin.material.${accountId}`);
      return Promise.resolve();
    },
  },
}));

jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(() =>
    Promise.resolve(new Uint8Array(32).fill(0x41))
  ),
  digestStringAsync: jest.fn((_algo: string, data: string) => {
    if (data === CORRECT_HASH || (data.length > 10 && data.endsWith("123456"))) {
      return Promise.resolve(CORRECT_HASH);
    }
    return Promise.resolve(WRONG_HASH);
  }),
  CryptoDigestAlgorithm: { SHA256: "SHA256" },
}));

import {
  requestTransactionalChallenge,
  resolveTransactionalChallenge,
  cancelTransactionalChallenge,
} from "../requestTransactionalChallenge";
import { validatePin } from "../validatePin.service";
import { setupPin } from "../setupPin.service";
import { useSecurityStore } from "../../store";

beforeEach(() => {
  mockStore.clear();
  useSecurityStore.getState().resetLocalState();
});

const baseRequest = {
  type: "PIX_TRANSFER" as const,
  accountId: "acc-1",
};

describe("requestTransactionalChallenge", () => {
  it("retorna not_configured quando conta não tem PIN", async () => {
    const result = await requestTransactionalChallenge(baseRequest);
    expect(result.status).toBe("not_configured");
  });

  it("retorna blocked quando bloqueio está ativo", async () => {
    await setupPin({
      pin: "123456",
      confirmation: "123456",
      accountId: "acc-1",
    });
    const raw = mockStore.get("security.pin.material.acc-1");
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed) {
      parsed.metadata.blockUntil = new Date(Date.now() + 60_000).toISOString();
      mockStore.set("security.pin.material.acc-1", JSON.stringify(parsed));
    }
    const result = await requestTransactionalChallenge(baseRequest);
    expect(result.status).toBe("blocked");
    expect("until" in result && result.until).toBeTruthy();
  });

  it("retorna authorized quando PIN correto", async () => {
    await setupPin({
      pin: "123456",
      confirmation: "123456",
      accountId: "acc-1",
    });
    const promise = requestTransactionalChallenge(baseRequest);
    while (!useSecurityStore.getState().currentChallenge) {
      await new Promise((r) => setImmediate(r));
    }
    const result = await resolveTransactionalChallenge("123456", "acc-1");
    expect(result.status).toBe("authorized");
    expect("method" in result && result.method).toBe("PIN");
    const awaited = await promise;
    expect(awaited.status).toBe("authorized");
  });

  it("retorna denied quando PIN incorreto", async () => {
    await setupPin({
      pin: "123456",
      confirmation: "123456",
      accountId: "acc-1",
    });
    const promise = requestTransactionalChallenge(baseRequest);
    while (!useSecurityStore.getState().currentChallenge) {
      await new Promise((r) => setImmediate(r));
    }
    const result = await resolveTransactionalChallenge("000000", "acc-1");
    expect(result.status).toBe("denied");
    const awaited = await promise;
    expect(awaited.status).toBe("denied");
  });

  it("retorna cancelled ao cancelar", async () => {
    await setupPin({
      pin: "123456",
      confirmation: "123456",
      accountId: "acc-1",
    });
    const promise = requestTransactionalChallenge(baseRequest);
    while (!useSecurityStore.getState().currentChallenge) {
      await new Promise((r) => setImmediate(r));
    }
    const cancelResult = cancelTransactionalChallenge();
    expect(cancelResult.status).toBe("cancelled");
    const awaited = await promise;
    expect(awaited.status).toBe("cancelled");
  });

  it("preenche currentChallenge ao iniciar e limpa ao resolver", async () => {
    await setupPin({
      pin: "123456",
      confirmation: "123456",
      accountId: "acc-1",
    });
    const promise = requestTransactionalChallenge(baseRequest);
    while (!useSecurityStore.getState().currentChallenge) {
      await new Promise((r) => setImmediate(r));
    }
    expect(useSecurityStore.getState().currentChallenge).toEqual(baseRequest);
    await resolveTransactionalChallenge("123456", "acc-1");
    await promise;
    expect(useSecurityStore.getState().currentChallenge).toBeNull();
  });

  it("limpa currentChallenge ao cancelar", async () => {
    await setupPin({
      pin: "123456",
      confirmation: "123456",
      accountId: "acc-1",
    });
    requestTransactionalChallenge(baseRequest);
    cancelTransactionalChallenge();
    expect(useSecurityStore.getState().currentChallenge).toBeNull();
  });

  it("cancelamento não incrementa tentativas", async () => {
    await setupPin({
      pin: "123456",
      confirmation: "123456",
      accountId: "acc-1",
    });
    const promise = requestTransactionalChallenge(baseRequest);
    while (!useSecurityStore.getState().currentChallenge) {
      await new Promise((r) => setImmediate(r));
    }
    cancelTransactionalChallenge();
    await promise;
    const result = await validatePin({ pin: "000000", accountId: "acc-1" });
    expect(result.status).toBe("invalid");
    expect("remainingAttempts" in result && result.remainingAttempts).toBe(2);
  });

  it("store não guarda segredo", () => {
    const state = useSecurityStore.getState();
    expect(state).not.toHaveProperty("pin");
    expect(state).not.toHaveProperty("hash");
    expect(state).not.toHaveProperty("salt");
  });
});
