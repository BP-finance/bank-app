/**
 * Testes do bootstrap HTTP.
 * Garante registro de token provider e interceptor 401, e idempotência.
 */

const mockSetTokenProvider = jest.fn();
const mockAddResponseInterceptor = jest.fn();

jest.mock("../../shared/api", () => ({
  httpClient: {
    setTokenProvider: (...args: unknown[]) => mockSetTokenProvider(...args),
    addResponseInterceptor: (...args: unknown[]) => mockAddResponseInterceptor(...args),
    clearTokenProvider: jest.fn(),
    clearDeviceProvider: jest.fn(),
    clearAuthToken: jest.fn(),
    removeInterceptor: jest.fn(),
  },
}));

import { initializeHttpClient, resetHttpClient } from "../httpBootstrap";

beforeEach(() => {
  jest.clearAllMocks();
  resetHttpClient();
});

describe("httpBootstrap", () => {
  it("initializeHttpClient registra token provider e interceptor 401", () => {
    initializeHttpClient();

    expect(mockSetTokenProvider).toHaveBeenCalledTimes(1);
    expect(mockAddResponseInterceptor).toHaveBeenCalledTimes(1);
  });

  it("initializeHttpClient é idempotente: segunda chamada não duplica registro", () => {
    initializeHttpClient();
    initializeHttpClient();

    expect(mockSetTokenProvider).toHaveBeenCalledTimes(1);
    expect(mockAddResponseInterceptor).toHaveBeenCalledTimes(1);
  });
});
