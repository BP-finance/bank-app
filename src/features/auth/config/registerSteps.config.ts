/**
 * Configuração de steps do fluxo de cadastro.
 * Suporta múltiplos campos por etapa.
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

/** Configuração de um campo individual */
export interface FieldConfig {
  id: RegisterFlowFieldKey;
  label: string;
  placeholder?: string;
  optional?: boolean;
  fieldType: StepFieldType;
  documentVariant?: "cpf" | "cnpj";
}

/** Configuração de uma etapa (pode ter múltiplos campos) */
export interface StepConfig {
  id: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
}

export interface RegisterStepsConfig {
  steps: StepConfig[];
}

const STEPS_PF: StepConfig[] = [
  {
    id: "dados-pessoais",
    title: "Dados pessoais",
    description: "Informe seu nome completo e CPF",
    fields: [
      { id: "nomeCompleto", label: "Nome completo", placeholder: "Nome e sobrenome", fieldType: "text" },
      { id: "cpf", label: "CPF", placeholder: "000.000.000-00", fieldType: "document", documentVariant: "cpf" },
    ],
  },
  {
    id: "contato",
    title: "Contato",
    description: "Como podemos entrar em contato com você",
    fields: [
      { id: "email", label: "E-mail", placeholder: "seu@email.com", fieldType: "email" },
      { id: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", fieldType: "phone" },
    ],
  },
  {
    id: "seguranca",
    title: "Segurança",
    description: "Crie uma senha segura para sua conta",
    fields: [
      { id: "senha", label: "Senha", placeholder: "Mínimo 8 caracteres", fieldType: "password" },
      { id: "confirmarSenha", label: "Confirmar senha", placeholder: "Repita a senha", fieldType: "password" },
    ],
  },
  {
    id: "finalizacao",
    title: "Finalização",
    description: "Revise e aceite os termos para concluir",
    fields: [
      { id: "acceptTerms", label: "Li e aceito os termos de uso e política de privacidade", fieldType: "terms" },
    ],
  },
];

const STEPS_PJ: StepConfig[] = [
  {
    id: "dados-empresa",
    title: "Dados da empresa",
    description: "Informações básicas da empresa",
    fields: [
      { id: "razaoSocial", label: "Razão social", placeholder: "Nome da empresa", fieldType: "text" },
      { id: "nomeFantasia", label: "Nome fantasia (opcional)", placeholder: "Nome fantasia", fieldType: "text", optional: true },
      { id: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", fieldType: "document", documentVariant: "cnpj" },
    ],
  },
  {
    id: "contato",
    title: "Contato",
    description: "Como podemos entrar em contato",
    fields: [
      { id: "email", label: "E-mail", placeholder: "contato@empresa.com", fieldType: "email" },
      { id: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", fieldType: "phone" },
    ],
  },
  {
    id: "representante",
    title: "Representante legal",
    description: "Dados do responsável pela empresa",
    fields: [
      { id: "representanteNome", label: "Nome do representante legal", placeholder: "Nome completo", fieldType: "text" },
      { id: "representanteCpf", label: "CPF do representante", placeholder: "000.000.000-00", fieldType: "document", documentVariant: "cpf" },
    ],
  },
  {
    id: "seguranca",
    title: "Segurança",
    description: "Crie uma senha segura para sua conta",
    fields: [
      { id: "senha", label: "Senha", placeholder: "Mínimo 8 caracteres", fieldType: "password" },
      { id: "confirmarSenha", label: "Confirmar senha", placeholder: "Repita a senha", fieldType: "password" },
    ],
  },
  {
    id: "finalizacao",
    title: "Finalização",
    description: "Revise e aceite os termos para concluir",
    fields: [
      { id: "acceptTerms", label: "Li e aceito os termos de uso e política de privacidade", fieldType: "terms" },
    ],
  },
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
