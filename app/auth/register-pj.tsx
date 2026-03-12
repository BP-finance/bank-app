/**
 * [DEPRECATED] Rota legada de cadastro PJ.
 * Redireciona para o fluxo novo unificado.
 * 
 * O cadastro PJ agora acontece no RegisterFlowScreen com:
 * - Engine de steps configurável
 * - Validação por campo, etapa e submit
 * - Progresso visual
 * - Mesma base técnica do PF
 * 
 * Esta rota existe apenas para compatibilidade com links externos.
 * 
 * TODO: Remover após confirmar que não há mais referências externas.
 */

import { Redirect } from "expo-router";

export default function RegisterPJPage() {
  return <Redirect href="/auth/register" />;
}
