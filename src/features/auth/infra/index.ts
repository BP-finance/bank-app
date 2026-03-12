/**
 * Camada de infraestrutura do módulo AUTH.
 * Conecta o domínio AUTH à infraestrutura compartilhada.
 *
 * Exports:
 * - authTokenProvider: provider de token para o httpClient
 * - auth401Interceptor: interceptor para tratamento reativo de 401
 */

export { authTokenProvider } from "./authHttpProvider";
export { auth401Interceptor } from "./auth401Interceptor";
