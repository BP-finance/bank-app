/**
 * Mappers de autenticação.
 * Transformam payloads internos em formato da API.
 */

import type { RegisterPFRequest } from "../types/register-pf.types";
import type { RegisterPJRequest } from "../types/register-pj.types";
import type {
  RegisterPFApiRequest,
  RegisterPJApiRequest,
} from "../api/auth.api.types";

/** Mapeia request interno de PF para formato da API */
export function mapRegisterPFToApiRequest(
  data: RegisterPFRequest
): RegisterPFApiRequest {
  return {
    nomeCompleto: data.nomeCompleto,
    cpf: data.cpf,
    email: data.email,
    telefone: data.telefone,
    senha: data.senha,
    acceptTerms: data.acceptTerms,
  };
}

/** Mapeia request interno de PJ para formato da API */
export function mapRegisterPJToApiRequest(
  data: RegisterPJRequest
): RegisterPJApiRequest {
  return {
    razaoSocial: data.razaoSocial,
    nomeFantasia: data.nomeFantasia,
    cnpj: data.cnpj,
    email: data.email,
    telefone: data.telefone,
    senha: data.senha,
    representanteLegal: {
      nome: data.representanteLegal.nome,
      cpf: data.representanteLegal.cpf,
    },
    acceptTerms: data.acceptTerms,
  };
}
