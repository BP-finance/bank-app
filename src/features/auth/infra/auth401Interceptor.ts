/**
 * Interceptor de resposta para tratamento reativo de 401.
 * Detecta token expirado, tenta refresh e reenvia a requisição original.
 *
 * Regras:
 * - Nunca tenta refresh na própria rota de refresh
 * - Usa flag interna _authRetried para evitar loop no reenvio
 * - Lock simples evita múltiplos refreshes simultâneos
 * - Em falha no refresh: limpa sessão via sessionManager
 * - Não faz navegação; apenas atualiza estado (store observa e reage)
 */

import { httpClient } from "../../../shared/api";
import type { ResponseContext, RequestContext } from "../../../shared/api";
import { refreshTokenService } from "../services/refreshToken.service";
import { sessionStorage, sessionManager } from "../session";
import { useAuthStore } from "../store/useAuthStore";

const INTERCEPTOR_NAME = "auth-401";
const REFRESH_ENDPOINT_PATH = "/auth/refresh";

/** Config interna para evitar loop de retry */
const AUTH_RETRIED_KEY = "_authRetried" as const;

/** Lock: apenas um refresh em andamento; demais aguardam o resultado */
let refreshInProgress: Promise<import("../types/refresh-token.types").RefreshResult> | null = null;

function isRefreshEndpoint(request: RequestContext): boolean {
  const path = request.url.toLowerCase();
  const fullPath = request.fullURL.toLowerCase();
  return path.includes(REFRESH_ENDPOINT_PATH) || fullPath.includes(REFRESH_ENDPOINT_PATH);
}

function hasRetryFlag(config: RequestContext["config"]): boolean {
  const ext = config as Record<string, unknown>;
  return ext[AUTH_RETRIED_KEY] === true;
}

function addRetryFlag(config: RequestContext["config"]): RequestContext["config"] {
  return { ...config, [AUTH_RETRIED_KEY]: true } as RequestContext["config"];
}

async function executeRetry<T>(request: RequestContext): Promise<ResponseContext<T>> {
  const { url, method, data, config } = request;
  const configWithRetry = addRetryFlag(config);

  let result: Awaited<ReturnType<typeof httpClient.get>>;

  switch (method) {
    case "GET":
      result = await httpClient.get<T>(url, configWithRetry);
      break;
    case "DELETE":
      result = await httpClient.delete<T>(url, configWithRetry);
      break;
    case "POST":
      result = await httpClient.post<T>(url, data, configWithRetry);
      break;
    case "PUT":
      result = await httpClient.put<T>(url, data, configWithRetry);
      break;
    case "PATCH":
      result = await httpClient.patch<T>(url, data, configWithRetry);
      break;
    default:
      return { request, response: { success: false, error: { code: "UNKNOWN", message: "Método não suportado" } }, status: 401 };
  }

  return {
    request,
    response: result as ResponseContext<T>["response"],
    status: result.success ? 200 : 401,
  };
}

async function getOrStartRefresh(): Promise<import("../types/refresh-token.types").RefreshResult> {
  if (!refreshInProgress) {
    refreshInProgress = refreshTokenService.refresh().finally(() => {
      refreshInProgress = null;
    });
  }
  return refreshInProgress;
}

export const auth401Interceptor = {
  name: INTERCEPTOR_NAME,

  async onResponse<T>(context: ResponseContext<T>): Promise<ResponseContext<T>> {
    const { request, response, status } = context;

    if (status !== 401) {
      return context;
    }

    if (isRefreshEndpoint(request)) {
      return context;
    }

    if (hasRetryFlag(request.config)) {
      return context;
    }

    const refreshResult = await getOrStartRefresh();

    if (!refreshResult.success) {
      await sessionManager.clear();
      useAuthStore.getState().setSession(null);
      return context;
    }

    await sessionStorage.saveTokens({
      accessToken: refreshResult.accessToken,
      refreshToken: refreshResult.refreshToken,
      expiresAt: refreshResult.expiresAt,
    });

    return executeRetry<T>(request);
  },
};
