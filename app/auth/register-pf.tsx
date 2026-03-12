/**
 * [DEPRECATED] Rota legada de cadastro PF.
 * Redireciona para o fluxo novo unificado.
 * 
 * O cadastro PF agora acontece no RegisterFlowScreen com:
 * - 4 etapas (Dados pessoais, Contato, Segurança, Finalização)
 * - Validação por campo, etapa e submit
 * - Progresso visual
 * 
 * Esta rota existe apenas para compatibilidade com links externos.
 * 
 * TODO: Remover após confirmar que não há mais referências externas.
 */

import { Redirect } from "expo-router";

export default function RegisterPFPage() {
  return <Redirect href="/auth/register" />;
}
