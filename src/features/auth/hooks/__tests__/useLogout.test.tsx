/**
 * Testes do useLogout.
 * Garante que navegação só ocorre quando logout retorna success.
 */

import { act, renderHook } from "@testing-library/react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { useLogout } from "../useLogout";

const mockReplace = jest.fn();
const mockClear = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("../../session", () => ({
  sessionManager: {
    clear: (...args: unknown[]) => mockClear(...args),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    session: { accessToken: "x", user: {} as never },
    isAuthenticated: true,
  });
});

describe("useLogout", () => {
  it("navega para login quando logout retorna success", async () => {
    mockClear.mockResolvedValue({ success: true, apiLogoutSuccess: true });

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockReplace).toHaveBeenCalled();
  });

  it("não navega quando logout retorna success false", async () => {
    mockClear.mockResolvedValue({
      success: false,
      apiLogoutSuccess: false,
      error: { code: "STORAGE_ERROR", message: "Falha." },
    });

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
