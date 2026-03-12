/**
 * Tipos genéricos do cliente HTTP.
 * Usados por todos os módulos que comunicam com o backend.
 */

/**
 * Métodos HTTP suportados.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Configuração de requisição HTTP.
 */
export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Erro padronizado retornado pelo backend.
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}

/**
 * Resposta de sucesso do backend.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Resposta de erro do backend.
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/**
 * Resposta genérica do backend (wrapper).
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Configuração do cliente HTTP.
 */
export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

/**
 * Contexto de requisição para interceptors.
 */
export interface RequestContext {
  url: string;
  method: HttpMethod;
  data?: unknown;
  config: HttpRequestConfig;
  fullURL: string;
}

/**
 * Contexto de resposta para interceptors.
 */
export interface ResponseContext<T = unknown> {
  request: RequestContext;
  response: ApiResponse<T>;
  status: number;
}

/**
 * Interceptor de requisição.
 * Executado ANTES da requisição ser enviada.
 */
export interface RequestInterceptor {
  name: string;
  onRequest: (context: RequestContext) => Promise<RequestContext> | RequestContext;
}

/**
 * Interceptor de resposta.
 * Executado APÓS a resposta ser recebida.
 */
export interface ResponseInterceptor {
  name: string;
  onResponse: <T>(context: ResponseContext<T>) => Promise<ResponseContext<T>> | ResponseContext<T>;
  onError?: (error: unknown, context: RequestContext) => Promise<never> | never;
}

/**
 * Interface pública do cliente HTTP.
 */
export interface HttpClient {
  get<T>(url: string, config?: HttpRequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<ApiResponse<T>>;

  setAuthToken(token: string): void;
  clearAuthToken(): void;
  getAuthToken(): string | null;

  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
  removeInterceptor(name: string): void;

  setTokenProvider(provider: import("./httpClient.providers").TokenProvider): void;
  clearTokenProvider(): void;
  setDeviceProvider(provider: import("./httpClient.providers").DeviceHeadersProvider): void;
  clearDeviceProvider(): void;
}
