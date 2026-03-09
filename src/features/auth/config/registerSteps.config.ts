/**
 * Configuração de steps do fluxo de cadastro.
 * Diferenças entre PF e PJ ficam concentradas aqui.
 */

import type { PersonType } from "../types";

/** Chaves do formulário - tipo explícito para validação e montagem de payload */
export type RegisterFlowFieldKey =
  | "nomeCompleto"
  | "cpf"
  | "cnpj"
  | "email"
  | "telefone"
  | "senha"
  | "confirmarSenha"
  | "acceptTerms"
  | "razaoSocial"
  | "nomeFantasia"
  | "representanteNome"
  | "representanteCpf";

/** Valores do formulário - todas as chaves possíveis */
export interface RegisterFlowFormValues {
  nomeCompleto: string;
  cpf: string;
  cnpj: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
  acceptTerms: boolean;
  razaoSocial: string;
  nomeFantasia: string;
  representanteNome: string;
  representanteCpf: string;
}

/** Tipo do campo no step (mapeia para AuthInput + formatter) */
export type StepFieldType =
  | "text"
  | "document"
  | "email"
  | "phone"
  | "password"
  | "terms";

export interface StepConfig {
  id: RegisterFlowFieldKey;
  label: string;
  placeholder?: string;
  optional?: boolean;
  fieldType: StepFieldType;
  documentVariant?: "cpf" | "cnpj";
}

export interface RegisterStepsConfig {
  steps: StepConfig[];
}

const STEPS_PF: StepConfig[] = [
  { id: "nomeCompleto", label: "Nome completo", placeholder: "Nome e sobrenome", fieldType: "text" },
  { id: "cpf", label: "CPF", placeholder: "000.000.000-00", fieldType: "document", documentVariant: "cpf" },
  { id: "email", label: "E-mail", placeholder: "seu@email.com", fieldType: "email" },
  { id: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", fieldType: "phone" },
  { id: "senha", label: "Senha", placeholder: "Mínimo 8 caracteres", fieldType: "password" },
  { id: "confirmarSenha", label: "Confirmar senha", placeholder: "Repita a senha", fieldType: "password" },
  { id: "acceptTerms", label: "Li e aceito os termos de uso e política de privacidade", fieldType: "terms" },
];

const STEPS_PJ: StepConfig[] = [
  { id: "razaoSocial", label: "Razão social", placeholder: "Nome da empresa", fieldType: "text" },
  { id: "nomeFantasia", label: "Nome fantasia (opcional)", placeholder: "Nome fantasia", fieldType: "text", optional: true },
  { id: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", fieldType: "document", documentVariant: "cnpj" },
  { id: "email", label: "E-mail", placeholder: "contato@empresa.com", fieldType: "email" },
  { id: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", fieldType: "phone" },
  { id: "representanteNome", label: "Nome do representante legal", placeholder: "Nome completo", fieldType: "text" },
  { id: "representanteCpf", label: "CPF do representante", placeholder: "000.000.000-00", fieldType: "document", documentVariant: "cpf" },
  { id: "senha", label: "Senha", placeholder: "Mínimo 8 caracteres", fieldType: "password" },
  { id: "confirmarSenha", label: "Confirmar senha", placeholder: "Repita a senha", fieldType: "password" },
  { id: "acceptTerms", label: "Li e aceito os termos de uso e política de privacidade", fieldType: "terms" },
];

/** Valores iniciais do formulário */
export const REGISTER_FLOW_INITIAL_VALUES: RegisterFlowFormValues = {
  nomeCompleto: "",
  cpf: "",
  cnpj: "",
  email: "",
  telefone: "",
  senha: "",
  confirmarSenha: "",
  acceptTerms: false,
  razaoSocial: "",
  nomeFantasia: "",
  representanteNome: "",
  representanteCpf: "",
};

export function getRegisterStepsConfig(personType: PersonType): RegisterStepsConfig {
  return personType === "PF" ? { steps: STEPS_PF } : { steps: STEPS_PJ };
}
