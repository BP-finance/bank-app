/**
 * [DEPRECATED] Rota legada de seleção de tipo de cadastro.
 * Redireciona para o fluxo novo unificado.
 * 
 * A seleção PF/PJ agora acontece na fase "welcome" do RegisterFlowScreen.
 * Esta rota existe apenas para compatibilidade com links externos.
 * 
 * TODO: Remover após confirmar que não há mais referências externas.
 */

import { Redirect } from "expo-router";

export default function RegisterTypePage() {
  return <Redirect href="/auth/register" />;
}
