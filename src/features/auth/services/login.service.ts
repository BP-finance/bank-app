/**
 * Serviço de login.
 * Orquestra: datasource → mapper → sessionManager → retorno.
 */

import { authDataSourceFactory } from "../data/datasources/authDataSourceFactory";
import { mapLoginDataToSession } from "../mappers/session.mapper";
import { sessionManager } from "../session";
import type { LoginRequest } from "../types/login.types";
import type { AuthSession } from "../types/auth-session.types";

export const loginService = {
  async execute(data: LoginRequest): Promise<AuthSession> {
    const dataSource = authDataSourceFactory();
    const apiData = await dataSource.login({
      documento: data.documento,
      senha: data.senha,
    });
    const session = mapLoginDataToSession(apiData);
    await sessionManager.persist(session);
    return session;
  },
};
