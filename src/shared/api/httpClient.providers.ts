/**
 * Interfaces de providers para o httpClient.
 * Permitem injeção de dependência sem acoplar shared a features.
 *
 * Módulos de domínio (auth, device) implementam estas interfaces
 * e as injetam no httpClient durante o bootstrap da aplicação.
 */

/**
 * Provider de token de autenticação.
 * Implementado pelo módulo AUTH e injetado no httpClient.
 *
 * O httpClient usa este provider para obter o token antes de cada requisição.
 * Se não houver provider configurado, requisições são feitas sem Authorization.
 */
export interface TokenProvider {
  /**
   * Retorna o access token atual.
   * @returns Token ou null se não houver sessão.
   */
  getAccessToken(): Promise<string | null>;

  /**
   * Retorna o refresh token atual.
   * @returns Token ou null se não houver sessão.
   */
  getRefreshToken(): Promise<string | null>;
}

/**
 * Provider de headers de dispositivo.
 * Implementado pelo módulo DEVICE/APP e injetado no httpClient.
 *
 * Preparado para implementação futura.
 */
export interface DeviceHeadersProvider {
  /**
   * Retorna identificador único do dispositivo.
   */
  getDeviceId(): Promise<string>;

  /**
   * Retorna versão do aplicativo.
   */
  getAppVersion(): string;

  /**
   * Retorna plataforma (ios, android).
   */
  getPlatform(): string;
}

/**
 * Configuração de providers do httpClient.
 * Passada durante o bootstrap para configurar o cliente.
 */
export interface HttpClientProviders {
  token?: TokenProvider;
  device?: DeviceHeadersProvider;
}
