/**
 * Infraestrutura de API compartilhada.
 * Cliente HTTP centralizado para comunicação com o backend.
 *
 * Exports:
 * - httpClient: instância singleton para uso em toda a aplicação
 * - createHttpClient: factory para criar instâncias customizadas (testes)
 * - tipos para módulos que precisam tipar requisições/respostas
 * - interfaces de providers para injeção de dependência
 */

export { httpClient, createHttpClient } from "./httpClient";

export type {
  HttpMethod,
  HttpRequestConfig,
  HttpClientConfig,
  ApiError,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  RequestContext,
  ResponseContext,
  RequestInterceptor,
  ResponseInterceptor,
  HttpClient,
} from "./httpClient.types";

export type {
  TokenProvider,
  DeviceHeadersProvider,
  HttpClientProviders,
} from "./httpClient.providers";
