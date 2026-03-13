/**
 * Testes do useAuthStore.
 * Cobre loadStoredSession (restore sucesso/falha) e logout (sucesso/falha).
 * Garante que store reflete corretamente o fluxo oficial e não mantém estado residual.
 */

import { useAuthStore } from "../useAuthStore";

const mockRestore = jest.fn();
const mockClear = jest.fn();

jest.mock("../../session", () => ({
  sessionManager: {
    restore: (...args: unknown[]) => mockRestore(...args),
    clear: (...args: unknown[]) => mockClear(...args),
  },
}));

const MOCK_SESSION = {
  accessToken: "token",
  refreshToken: "refresh",
  user: {
    id: "1",
    nome: "User",
    email: "user@test.com",
    documento: "11111111111",
    tipoConta: "PF" as const,
    onboardingStatus: "aprovado" as const,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    session: null,
    isAuthenticated: false,
    isInitialized: false,
    restoreError: null,
  });
});

describe("useAuthStore.loadStoredSession", () => {
  it("quando restore tem sucesso: seta session, isAuthenticated true, restoreError null", async () => {
    mockRestore.mockResolvedValue({ success: true, session: MOCK_SESSION });

    await useAuthStore.getState().loadStoredSession();

    const state = useAuthStore.getState();
    expect(state.session).toEqual(MOCK_SESSION);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitialized).toBe(true);
    expect(state.restoreError).toBeNull();
  });

  it("quando restore falha com TOKEN_EXPIRED: limpa session, seta restoreError, sem estado residual", async () => {
    mockRestore.mockResolvedValue({
      success: false,
      session: null,
      error: { code: "TOKEN_EXPIRED", message: "Sessão expirada." },
    });

    useAuthStore.setState({ session: MOCK_SESSION, isAuthenticated: true });
    await useAuthStore.getState().loadStoredSession();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitialized).toBe(true);
    expect(state.restoreError?.code).toBe("TOKEN_EXPIRED");
  });

  it("quando restore falha com HYDRATION_FAILED: limpa session, seta restoreError", async () => {
    mockRestore.mockResolvedValue({
      success: false,
      session: null,
      error: { code: "HYDRATION_FAILED", message: "Falha ao hidratar." },
    });

    await useAuthStore.getState().loadStoredSession();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.restoreError?.code).toBe("HYDRATION_FAILED");
  });
});

describe("useAuthStore.logout", () => {
  it("quando clear tem sucesso: limpa store e retorna success true", async () => {
    mockClear.mockResolvedValue({ success: true, apiLogoutSuccess: true });
    useAuthStore.setState({ session: MOCK_SESSION, isAuthenticated: true });

    const result = await useAuthStore.getState().logout();

    expect(result.success).toBe(true);
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("quando clear falha: não limpa store e retorna success false", async () => {
    mockClear.mockResolvedValue({
      success: false,
      apiLogoutSuccess: false,
      error: { code: "STORAGE_ERROR", message: "Falha ao limpar." },
    });
    useAuthStore.setState({ session: MOCK_SESSION, isAuthenticated: true });

    const result = await useAuthStore.getState().logout();

    expect(result.success).toBe(false);
    const state = useAuthStore.getState();
    expect(state.session).toEqual(MOCK_SESSION);
    expect(state.isAuthenticated).toBe(true);
  });
});
