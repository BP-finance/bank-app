/**
 * Cliente HTTP centralizado.
 * Ponto único de comunicação com o backend.
 *
 * Responsabilidades:
 * - Executar requisições HTTP (GET, POST, PUT, PATCH, DELETE)
 * - Aplicar configuração base (baseURL, headers, timeout)
 * - Executar interceptors de requisição e resposta
 * - Gerenciar token de autenticação via TokenProvider
 * - Tratar erros de rede
 *
 * Providers:
 * - TokenProvider: obtém token de autenticação (injetado pelo módulo AUTH)
 * - DeviceHeadersProvider: obtém headers de dispositivo (futuro)
 *
 * O httpClient funciona normalmente sem providers configurados.
 * Requisições são feitas sem Authorization se não houver TokenProvider.
 */

import type {
  HttpClient,
  HttpClientConfig,
  HttpMethod,
  HttpRequestConfig,
  ApiResponse,
  ApiErrorResponse,
  RequestContext,
  ResponseContext,
  RequestInterceptor,
  ResponseInterceptor,
} from "./httpClient.types";
import type { TokenProvider, DeviceHeadersProvider } from "./httpClient.providers";

const DEFAULT_CONFIG: HttpClientConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "",
  timeout: 30000,
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

/**
 * Cria instância do cliente HTTP.
 */
function createHttpClient(initialConfig: Partial<HttpClientConfig> = {}): HttpClient {
  const config: HttpClientConfig = { ...DEFAULT_CONFIG, ...initialConfig };
  let authToken: string | null = null;
  let tokenProvider: TokenProvider | null = null;
  let deviceProvider: DeviceHeadersProvider | null = null;
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];

  /**
   * Constrói URL completa com baseURL e query params.
   */
  function buildURL(url: string, params?: Record<string, string | number | boolean>): string {
    const baseURL = config.baseURL.endsWith("/")
      ? config.baseURL.slice(0, -1)
      : config.baseURL;
    const path = url.startsWith("/") ? url : `/${url}`;
    let fullURL = `${baseURL}${path}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      fullURL += `?${searchParams.toString()}`;
    }

    return fullURL;
  }

  /**
   * Obtém token de autenticação.
   * Prioridade: 1) authToken manual, 2) tokenProvider
   */
  async function getAuthorizationToken(): Promise<string | null> {
    if (authToken) {
      return authToken;
    }
    if (tokenProvider) {
      return tokenProvider.getAccessToken();
    }
    return null;
  }

  /**
   * Constrói headers da requisição.
   * Agora é async para suportar tokenProvider.
   */
  async function buildHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const headers: Record<string, string> = { ...config.defaultHeaders };

    const token = await getAuthorizationToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (deviceProvider) {
      try {
        const [deviceId] = await Promise.all([deviceProvider.getDeviceId()]);
        headers["X-Device-Id"] = deviceId;
        headers["X-App-Version"] = deviceProvider.getAppVersion();
        headers["X-Platform"] = deviceProvider.getPlatform();
      } catch {
        // Device headers são opcionais, não bloqueia requisição
      }
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Executa interceptors de requisição.
   */
  async function runRequestInterceptors(context: RequestContext): Promise<RequestContext> {
    let currentContext = context;
    for (const interceptor of requestInterceptors) {
      currentContext = await interceptor.onRequest(currentContext);
    }
    return currentContext;
  }

  /**
   * Executa interceptors de resposta.
   */
  async function runResponseInterceptors<T>(
    context: ResponseContext<T>
  ): Promise<ResponseContext<T>> {
    let currentContext = context;
    for (const interceptor of responseInterceptors) {
      currentContext = await interceptor.onResponse(currentContext);
    }
    return currentContext;
  }

  /**
   * Executa interceptors de erro.
   */
  async function runErrorInterceptors(
    error: unknown,
    requestContext: RequestContext
  ): Promise<never> {
    for (const interceptor of responseInterceptors) {
      if (interceptor.onError) {
        await interceptor.onError(error, requestContext);
      }
    }
    throw error;
  }

  /**
   * Cria resposta de erro de rede.
   */
  function createNetworkErrorResponse(message: string): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message,
      },
    };
  }

  /**
   * Executa requisição HTTP.
   */
  async function request<T>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    requestConfig: HttpRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const fullURL = buildURL(url, requestConfig.params);
    const headers = await buildHeaders(requestConfig.headers);
    const timeout = requestConfig.timeout ?? config.timeout;

    let context: RequestContext = {
      url,
      method,
      data,
      config: requestConfig,
      fullURL,
    };

    try {
      context = await runRequestInterceptors(context);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchConfig: RequestInit = {
        method,
        headers,
        signal: requestConfig.signal ?? controller.signal,
      };

      if (data !== undefined && method !== "GET") {
        fetchConfig.body = JSON.stringify(data);
      }

      const response = await fetch(context.fullURL, fetchConfig);
      clearTimeout(timeoutId);

      let responseData: ApiResponse<T>;

      try {
        responseData = await response.json();
      } catch {
        if (response.ok) {
          responseData = { success: true, data: {} as T };
        } else {
          responseData = createNetworkErrorResponse(
            `HTTP ${response.status}: ${response.statusText}`
          );
        }
      }

      const responseContext = await runResponseInterceptors<T>({
        request: context,
        response: responseData,
        status: response.status,
      });

      return responseContext.response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return createNetworkErrorResponse("Requisição cancelada por timeout.");
        }
        await runErrorInterceptors(error, context);
        return createNetworkErrorResponse(error.message);
      }
      return createNetworkErrorResponse("Erro de conexão desconhecido.");
    }
  }

  return {
    get<T>(url: string, requestConfig?: HttpRequestConfig): Promise<ApiResponse<T>> {
      return request<T>("GET", url, undefined, requestConfig);
    },

    post<T>(url: string, data?: unknown, requestConfig?: HttpRequestConfig): Promise<ApiResponse<T>> {
      return request<T>("POST", url, data, requestConfig);
    },

    put<T>(url: string, data?: unknown, requestConfig?: HttpRequestConfig): Promise<ApiResponse<T>> {
      return request<T>("PUT", url, data, requestConfig);
    },

    patch<T>(url: string, data?: unknown, requestConfig?: HttpRequestConfig): Promise<ApiResponse<T>> {
      return request<T>("PATCH", url, data, requestConfig);
    },

    delete<T>(url: string, requestConfig?: HttpRequestConfig): Promise<ApiResponse<T>> {
      return request<T>("DELETE", url, undefined, requestConfig);
    },

    setAuthToken(token: string): void {
      authToken = token;
    },

    clearAuthToken(): void {
      authToken = null;
    },

    getAuthToken(): string | null {
      return authToken;
    },

    addRequestInterceptor(interceptor: RequestInterceptor): void {
      requestInterceptors.push(interceptor);
    },

    addResponseInterceptor(interceptor: ResponseInterceptor): void {
      responseInterceptors.push(interceptor);
    },

    removeInterceptor(name: string): void {
      const reqIndex = requestInterceptors.findIndex((i) => i.name === name);
      if (reqIndex !== -1) {
        requestInterceptors.splice(reqIndex, 1);
      }
      const resIndex = responseInterceptors.findIndex((i) => i.name === name);
      if (resIndex !== -1) {
        responseInterceptors.splice(resIndex, 1);
      }
    },

    setTokenProvider(provider: TokenProvider): void {
      tokenProvider = provider;
    },

    clearTokenProvider(): void {
      tokenProvider = null;
    },

    setDeviceProvider(provider: DeviceHeadersProvider): void {
      deviceProvider = provider;
    },

    clearDeviceProvider(): void {
      deviceProvider = null;
    },
  };
}

/**
 * Instância singleton do cliente HTTP.
 * Use esta instância em toda a aplicação.
 */
export const httpClient = createHttpClient();

/**
 * Factory para criar instâncias customizadas (útil para testes).
 */
export { createHttpClient };
