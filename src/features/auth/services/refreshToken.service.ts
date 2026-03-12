/**
 * Serviço de refresh token.
 * Stub inicial: retorna falha (refresh não implementado).
 *
 * Fluxo futuro:
 * 1. Obter refreshToken do sessionStorage
 * 2. Chamar authDataSource.refreshTokens(refreshToken)
 * 3. Mapear RefreshApiData para RefreshSuccess
 * 4. Persistir novos tokens via sessionManager.persist()
 * 5. Retornar RefreshSuccess
 *
 * A interface AuthDataSource será estendida com refreshTokens()
 * quando o endpoint real estiver disponível.
 */

import { authErrorFactory } from "../errors";
import type { RefreshResult } from "../types/refresh-token.types";

export const refreshTokenService = {
  /**
   * Tenta renovar a sessão usando o refresh token.
   * Stub: sempre retorna falha. Implementação real será
   * adicionada quando o datasource/endpoint estiver pronto.
   *
   * @returns RefreshResult com success: false
   */
  async refresh(): Promise<RefreshResult> {
    return {
      success: false,
      error: authErrorFactory.sessionExpired(
        new Error("Refresh token não implementado.")
      ),
    };
  },
};
