/**
 * Testes da persistência segura do PIN (TASK 3).
 * Cobre: persistência, isolamento, limpeza, segurança do material.
 */

const mockStore = new Map<string, string>();

jest.mock("../pinSecureStoreAdapter", () => ({
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
  digestStringAsync: jest.fn((_algo: string, data: string) =>
    Promise.resolve("abc123hash456")
  ),
  CryptoDigestAlgorithm: { SHA256: "SHA256" },
}));

import {
  readPinMaterial,
  writePinMaterial,
  persistPinForAccount,
  updatePinMetadata,
  clearPinMaterial,
  hasPinForAccount,
} from "../index";
import { clearSecurityState } from "../../../services/clearSecurityState";

const createValidMaterial = () => ({
  hash: "hashed-pin-value",
  salt: "salt-hex",
  algorithmVersion: 1,
  metadata: {
    failedAttempts: 0,
    blockUntil: null,
    createdAt: new Date().toISOString(),
  },
});

beforeEach(() => {
  mockStore.clear();
});

describe("pinStorageGateway — Persistência", () => {
  it("persiste material de PIN por accountId", async () => {
    const accountId = "user-1";
    const material = createValidMaterial();

    const result = await writePinMaterial(accountId, material);

    expect(result.success).toBe(true);
    const read = await readPinMaterial(accountId);
    expect(read.success).toBe(true);
    expect(read.success && read.data).toEqual(material);
  });

  it("lê corretamente o material persistido", async () => {
    const accountId = "user-2";
    const material = createValidMaterial();
    await writePinMaterial(accountId, material);

    const result = await readPinMaterial(accountId);

    expect(result.success).toBe(true);
    expect(result.success && result.data).toMatchObject({
      hash: material.hash,
      salt: material.salt,
      metadata: expect.objectContaining({
        failedAttempts: 0,
        blockUntil: null,
      }),
    });
  });

  it("atualiza metadados corretamente", async () => {
    const accountId = "user-3";
    const material = createValidMaterial();
    await writePinMaterial(accountId, material);

    const updateResult = await updatePinMetadata(accountId, {
      failedAttempts: 2,
      blockUntil: "2025-12-31T23:59:59.000Z",
    });

    expect(updateResult.success).toBe(true);
    const read = await readPinMaterial(accountId);
    expect(read.success).toBe(true);
    expect(read.success && read.data?.metadata).toEqual({
      ...material.metadata,
      failedAttempts: 2,
      blockUntil: "2025-12-31T23:59:59.000Z",
    });
  });
});

describe("pinStorageGateway — Isolamento", () => {
  it("contas diferentes usam chaves diferentes", async () => {
    const materialA = { ...createValidMaterial(), hash: "hash-a" };
    const materialB = { ...createValidMaterial(), hash: "hash-b" };

    await writePinMaterial("account-a", materialA);
    await writePinMaterial("account-b", materialB);

    const readA = await readPinMaterial("account-a");
    const readB = await readPinMaterial("account-b");

    expect(readA.success && readA.data?.hash).toBe("hash-a");
    expect(readB.success && readB.data?.hash).toBe("hash-b");
  });

  it("material de uma conta não interfere na outra", async () => {
    await writePinMaterial("account-1", createValidMaterial());

    const read2 = await readPinMaterial("account-2");
    expect(read2.success).toBe(true);
    expect(read2.success && read2.data).toBeNull();
  });
});

describe("pinStorageGateway — Limpeza", () => {
  it("clearPinMaterial remove apenas o material da conta alvo", async () => {
    await writePinMaterial("account-x", createValidMaterial());
    await writePinMaterial("account-y", createValidMaterial());

    const clearResult = await clearPinMaterial("account-x");

    expect(clearResult.success).toBe(true);
    expect(await readPinMaterial("account-x")).toMatchObject({
      success: true,
      data: null,
    });
    expect(await hasPinForAccount("account-y")).toBe(true);
  });

  it("clearSecurityState com accountId aciona a limpeza correta", async () => {
    await writePinMaterial("account-z", createValidMaterial());

    await clearSecurityState({ accountId: "account-z" });

    expect(await hasPinForAccount("account-z")).toBe(false);
  });
});

describe("pinStorageGateway — Segurança", () => {
  it("nunca persiste PIN em texto puro", async () => {
    const accountId = "user-sec";
    await persistPinForAccount(accountId, "123456");

    const raw = mockStore.get("security.pin.material.user-sec");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.pin).toBeUndefined();
    expect(parsed).not.toHaveProperty("pin");
    expect(parsed.hash).toBeDefined();
    expect(typeof parsed.hash).toBe("string");
  });

  it("material persistido contém apenas hash, salt e metadados", async () => {
    const material = createValidMaterial();
    await writePinMaterial("user-check", material);

    const raw = mockStore.get("security.pin.material.user-check");
    const parsed = JSON.parse(raw!);

    expect(Object.keys(parsed).sort()).toEqual([
      "algorithmVersion",
      "hash",
      "metadata",
      "salt",
    ]);
    expect(parsed.metadata).toHaveProperty("failedAttempts");
    expect(parsed.metadata).toHaveProperty("blockUntil");
    expect(parsed.metadata).toHaveProperty("createdAt");
  });
});

describe("pinStorageGateway — Metadados duráveis", () => {
  it("failedAttempts persiste após escrita e leitura", async () => {
    const material = createValidMaterial();
    material.metadata.failedAttempts = 3;
    await writePinMaterial("user-meta", material);

    const read = await readPinMaterial("user-meta");
    expect(read.success && read.data?.metadata.failedAttempts).toBe(3);
  });

  it("blockUntil persiste após escrita e leitura", async () => {
    const material = createValidMaterial();
    material.metadata.blockUntil = "2026-01-15T10:00:00.000Z";
    await writePinMaterial("user-block", material);

    const read = await readPinMaterial("user-block");
    expect(read.success && read.data?.metadata.blockUntil).toBe(
      "2026-01-15T10:00:00.000Z"
    );
  });
});
