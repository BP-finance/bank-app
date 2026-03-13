/**
 * Testes do auth401Interceptor.
 * Garante que 401 + refresh failed invalida sessão via fluxo oficial (store.logout).
 */

import { useAuthStore } from "../../store/useAuthStore";
import { auth401Interceptor } from "../auth401Interceptor";

const mockRefresh = jest.fn();
const mockLogout = jest.fn();

jest.mock("../../services/refreshToken.service", () => ({
  refreshTokenService: {
    refresh: (...args: unknown[]) => mockRefresh(...args),
  },
}));

jest.mock("../../store/useAuthStore", () => ({
  useAuthStore: {
    getState: () => ({
      logout: mockLogout,
    }),
  },
}));

jest.mock("../../../../shared/api", () => ({
  httpClient: {},
}));

jest.mock("../../observability/authLogger", () => ({
  authLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    safePath: (p: string) => p,
  },
}));

const createContext = (status: number, url = "/api/user") => ({
  request: {
    url,
    method: "GET" as const,
    data: undefined,
    config: {},
    fullURL: `https://api.example.com${url}`,
  },
  response: { success: true, data: {} },
  status,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("auth401Interceptor", () => {
  it("quando status não é 401: retorna context inalterado", async () => {
    const context = createContext(200);

    const result = await auth401Interceptor.onResponse(context);

    expect(result).toBe(context);
    expect(mockRefresh).not.toHaveBeenCalled();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("quando 401 e refresh falha: chama store.logout (fluxo oficial de invalidação)", async () => {
    mockRefresh.mockResolvedValue({
      success: false,
      error: { code: "SESSION_EXPIRED", message: "Sessão expirada" },
    });

    const context = createContext(401);

    const result = await auth401Interceptor.onResponse(context);

    expect(mockRefresh).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
    expect(result).toBe(context);
  });

  it("quando request é para refresh endpoint: não tenta refresh", async () => {
    const context = createContext(401, "/auth/refresh");

    await auth401Interceptor.onResponse(context);

    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
