/**
 * Bootstrap do httpClient.
 * Configura providers e interceptors no ponto de inicialização da aplicação.
 *
 * Este arquivo conecta módulos de domínio (auth, device) ao httpClient,
 * mantendo a separação entre shared e features.
 *
 * Uso:
 * Chame initializeHttpClient() no ponto de entrada do app (App.tsx ou _layout.tsx).
 */

import { httpClient } from "../shared/api";
import { authTokenProvider, auth401Interceptor } from "../features/auth/infra";

/**
 * Inicializa o httpClient com os providers e interceptors necessários.
 * Deve ser chamado uma vez durante o startup da aplicação.
 */
export function initializeHttpClient(): void {
  httpClient.setTokenProvider(authTokenProvider);
  httpClient.addResponseInterceptor(auth401Interceptor);

  // Quando implementado, adicionar DeviceProvider:
  // httpClient.setDeviceProvider(deviceHeadersProvider);
}

/**
 * Remove todos os providers e o interceptor de 401 do httpClient.
 * Útil para testes ou quando necessário reiniciar o estado.
 */
export function resetHttpClient(): void {
  httpClient.clearTokenProvider();
  httpClient.clearDeviceProvider();
  httpClient.clearAuthToken();
  httpClient.removeInterceptor(auth401Interceptor.name);
}
